import express from 'express';
import axios from 'axios';
import https from 'https';
import { Player, FantasyLeague, FantasyTeam, Team, GameWeek, Match, Standing } from '../../models.js';
const router = express.Router();

router.get('/', async (req, res) => {
    let error = false;
    let run_team_points = false;
    let current_gameweek = null;
    let updated_gameweek = null;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //Updating Gameweek
    console.log("Updating GameWeek");
    try {
        current_gameweek = await GameWeek.findOne({ is_current: true });
        const seasonID = process.env.NEXT_PUBLIC_SEASON_ID
        const api_url = "https://api.sportmonks.com/v3/football/rounds/seasons/"
        const agent = new https.Agent({ rejectUnauthorized: false });
        axios.defaults.httpsAgent = agent
        let full_URL = api_url + seasonID
        let gameweek_data = [];
        let response = await axios.get(full_URL, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
            },
            agent: agent
        })
        if (response.status === 200) {
            gameweek_data = response.data.data;
            for (const gameweek of gameweek_data) {
                const query = {
                    id: gameweek.id,
                    seasonID: seasonID,
                    name: gameweek.name,
                    finished: gameweek.finished,
                    is_current: gameweek.is_current,
                    starting_at: gameweek.starting_at,
                    ending_at: gameweek.ending_at,
                    games_in_current_week: gameweek.games_in_current_week,
                };
                console.log("gameweek : " + gameweek.name + " - " + gameweek.is_current)
                const res = await GameWeek.updateOne({ id: gameweek.id }, { $set: query }, { upsert: true });
            }
            console.log("Gameweeks done");
        } else {
            console.log("Failed to fetch data from API");
        }
    } catch (err) {
        console.log(err);
        error = true;
        console.log("Error updating game week");
    }

    // Check for GW Change after call. If prev GW ended then run team points
    updated_gameweek = await GameWeek.findOne({ is_current: true });
    console.log("current_gameweek : " + current_gameweek.name)
    console.log("updated_gameweek : " + updated_gameweek.name)
    if (updated_gameweek.name !== current_gameweek.name) {
        run_team_points = true;
        console.log("Gameweek has changed. Let's update team points")
    }

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //Updating League Team Points
    console.log("run_team_points : " + run_team_points)
    if (run_team_points) {
        try {
            console.log("Current GW : " + current_gameweek.name)

            let all_leagues = await FantasyLeague.find({ is_deleted: false, paid: true }).populate("draftID").populate("head_to_head_points.team").populate("classic_points.team");
            all_leagues = all_leagues.filter(league => league.draftID.state == "Ended");

            for (const one_league of all_leagues) {
                console.log("League Name : " + one_league.league_name + " - " + one_league.league_configuration.format)
                // if (one_league.draftID.state === "Ended") {
                if (one_league.league_configuration.format === "Head to Head") {
                    let each_team_fpl_points = [];
                    // GET POINTS FOR ALL TEAMS ACCORDING TO LEAGUE
                    for (const team of one_league.head_to_head_points) {
                        let teamDetails = team.team;
                        let team_points = 0;
                        //console.log("team");
                        //console.log(teamDetails.team_name);
                        team_points = await calculateTeamPoints(one_league, teamDetails, current_gameweek);
                        each_team_fpl_points.push({ team: teamDetails, points: team_points, result: "draw" });
                    }
                    //console.log("each_team_fpl_points");
                    for (const each_team_fpl_point of each_team_fpl_points) {
                        console.log(each_team_fpl_point.team.team_name + " - " + each_team_fpl_point.points + " - " + each_team_fpl_point.result);
                    }
                    // GET CURRENT GAME WEEK
                    let gw_fixtures = one_league.league_fixtures.filter(item => item.gameweek == current_gameweek.name);
                    //console.log("gw_fixtures");
                    //console.log(gw_fixtures);

                    // GET FIXTURES PLAYED IN GAME WEEK AND DECIDE WINNER
                    gw_fixtures.forEach(item => {
                        let home = each_team_fpl_points.find(fpl_item => fpl_item.team._id.equals(item.teams[0]))
                        let away = each_team_fpl_points.find(fpl_item => fpl_item.team._id.equals(item.teams[1]))
                        //console.log("home")
                        //console.log(home.team.team_name)
                        //console.log("away")
                        //console.log(away.team.team_name)
                        let winner = null;
                        let loser = null;
                        if (home.points > away.points) {
                            winner = each_team_fpl_points.findIndex(x => x.team._id == home.team._id);
                            loser = each_team_fpl_points.findIndex(x => x.team._id == away.team._id);
                        } else if (away.points > home.points) {
                            winner = each_team_fpl_points.findIndex(x => x.team._id == away.team._id);
                            loser = each_team_fpl_points.findIndex(x => x.team._id == home.team._id);
                        } else {
                            //match drew, do nothing
                        }
                        // mark team who won or lost
                        //console.log("winner")
                        //console.log(winner)
                        //console.log("loser")
                        //console.log(loser)
                        if (winner !== undefined && winner !== null) each_team_fpl_points[winner].result = "win";
                        if (loser !== undefined && loser !== null) each_team_fpl_points[loser].result = "lost";
                    })

                    // ASSIGN POINTS ACCORDING TO RESULTS
                    one_league.head_to_head_points.forEach((team) => {
                        //console.log("inside assign")
                        //console.log("team")
                        //console.log(team.team.team_name)
                        let teamObj = each_team_fpl_points.find(fpl_team => fpl_team.team._id.equals(team.team._id))
                        //console.log("team")
                        //console.log("points : " + team.points)
                        //console.log("wins : " + team.wins)
                        //console.log("loses : " + team.loses)
                        //console.log("draws : " + team.draws)
                        //console.log("form : " + team.form)
                        //console.log("teamObj")
                        //console.log("result : " + teamObj.result)
                        //Won
                        if (teamObj.result === "win") {
                            team.points += 3;
                            team.wins += 1;
                            team.form = team.form + " W";
                        }
                        // Lost
                        else if (teamObj.result === "lost") {
                            team.loses += 1;
                            team.form = team.form + " L";
                        }
                        // Drew
                        else {
                            team.points += 1;
                            team.draws += 1;
                            team.form = team.form + " D";
                        }
                        console.log("final team output")
                        console.log("team : " + team.team.team_name)
                        console.log("points : " + team.points)
                        console.log("wins : " + team.wins)
                        console.log("loses : " + team.loses)
                        console.log("draws : " + team.draws)
                        console.log("form : " + team.form)
                    })
                }
                else {
                    let each_team_fpl_points = [];
                    // GET POINTS FOR ALL TEAMS ACCORDING TO LEAGUE
                    for (const team of one_league.classic_points) {
                        let teamDetails = team.team;
                        let team_points = 0;
                        team_points = await calculateTeamPoints(one_league, teamDetails, current_gameweek);
                        each_team_fpl_points.push({ team: teamDetails, points: team_points });
                    }
                    // console.log("each_team_fpl_points");
                    // console.log(each_team_fpl_points);
                    // ASSIGN POINTS ACCORDING TO RESULTS
                    one_league.classic_points.forEach((team) => {
                        // console.log("team")
                        // console.log(team)
                        let teamObj = each_team_fpl_points.find(fpl_team => fpl_team.team._id.equals(team.team._id))
                        // console.log("teamObj")
                        // console.log(teamObj)
                        //Add points to total and current
                        team.points_total = team.points_total + teamObj.points;
                        team.points_current = teamObj.points;
                        console.log("final team output")
                        console.log(team)
                    })
                }
                one_league.save();
            }
            // }
        }
        catch (err) {
            console.log(err);
            error = true;
            console.log("Error updating league team points");
        }
    }

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //End of Call
    return res.status(200).json({
        error: error,
        message: "done"
    });


    // res.status(200).json({ message: "Test route is working!" });
});

const calculateTeamPoints = async (league, team, gameweek) => {
    try {
        let points = 0;
        // console.log("team");
        // console.log(team);
        let gameweekSquad = team.history.find(item => item.gameweek == gameweek._id)
        if (!gameweekSquad) {
            gameweekSquad = { gameweek: gameweek, players: team.players }
        }
        for (let playerObj of gameweekSquad.players) {
            // console.log("entering player loop");
            if (playerObj.in_team) {
                console.log("player in team");
                // console.log(playerObj);
                let playerDetails = await Player.findOne({ _id: playerObj.player });
                // console.log("playerDetails")
                // console.log(playerDetails)
                if (playerDetails) {
                    let playerPoints = await calculatePlayerPoints(league, playerDetails, gameweek);
                    console.log("playerPoints")
                    console.log(playerDetails.name)
                    console.log(playerPoints)
                    if (!isNaN(playerPoints)) {
                        // console.log("inside nan condition")
                        // if (playerObj.captain) { playerPoints = playerPoints * 2; }
                        points += playerPoints;
                    }
                    console.log("new team points")
                    console.log(points)
                }
            }
        }
        // console.log(team.team_name);
        // console.log("points");
        // console.log(points);
        return points;
    } catch (err) {
        console.log("error occurred");
        console.log(err);
        throw err;
    }
}

const calculatePlayerPoints = async (league, player, gameweek) => {
    try {
        let points = 0;
        let stats = {
            "goals": 0,
            "assists": 0,
            "clean-sheet": 0,
            "goals-conceded": 0,
            "penalty_save": 0,
            "saves": 0,
            "penalty_miss": 0,
            "yellowcards": 0,
            "redcards": 0,
            "minutes-played": 0,
            "tackles": 0,
            "interceptions": 0,
            "bonus": 0
        };
        let points_config = {
            "goals": 5,
            "assists": 3,
            "clean-sheet": 4,
            "goals-conceded": -1,
            "penalty_save": 5,
            "saves": 0.333,
            "penalty_miss": -3,
            "yellowcards": -1,
            "redcards": -3,
            "minutes-played": 1,
            "tackles": 0.2,
            "interceptions": 0.2,
            "bonus": 1
        };
        league.points_configuration.forEach((item) => {
            if (item.gameweek === gameweek.name) {
                points_config["goals"] = item["goals"];
                points_config["assists"] = item["assists"];
                points_config["clean-sheet"] = item["clean-sheet"];
                points_config["goals-conceded"] = item["goals-conceded"];
                points_config["penalty_save"] = item["penalty_save"];
                points_config["saves"] = item["saves"];
                points_config["penalty_miss"] = item["penalty_miss"];
                points_config["yellowcards"] = item["yellowcards"];
                points_config["redcards"] = item["redcards"];
                points_config["minutes-played"] = item["minutes-played"];
                points_config["tackles"] = item["tackles"];
                points_config["interceptions"] = item["interceptions"];
                points_config["bonus"] = item["bonus"];
            }
        })

        player.points.forEach((item) => {
            if (item.gameweek.equals(gameweek._id)) {
                stats["goals"] = item.fpl_stats["goals"];
                stats["assists"] = item.fpl_stats["assists"];
                stats["clean-sheet"] = item.fpl_stats["clean-sheet"];
                stats["goals-conceded"] = item.fpl_stats["goals-conceded"];
                stats["penalty_save"] = item.fpl_stats["penalty_save"];
                stats["saves"] = item.fpl_stats["saves"];
                stats["penalty_miss"] = item.fpl_stats["penalty_miss"];
                stats["yellowcards"] = item.fpl_stats["yellowcards"];
                stats["redcards"] = item.fpl_stats["redcards"];
                stats["minutes-played"] = item.fpl_stats["minutes-played"];
                stats["tackles"] = item.fpl_stats["tackles"];
                stats["interceptions"] = item.fpl_stats["interceptions"];
                stats["bonus"] = item.fpl_stats["bonus"];
            }
        })
        // console.log("points_config");
        // console.log(points_config);
        // console.log("stats");
        // console.log(stats);
        if (stats["minutes-played"] > 60) points = points + (2 * points_config["minutes-played"])
        else if (stats["minutes-played"] > 30) points = points + (1 * points_config["minutes-played"])
        points = points + (stats.goals * points_config["goals"]);
        points = points + (stats.assists * points_config["assists"]);
        if (player.position_name == "Goalkeeper" || player.position_name == "Defender") points = points + (stats["clean-sheet"] * points_config["clean-sheet"]);
        if (player.position_name == "Goalkeeper" || player.position_name == "Defender") points = points + (stats["goals-conceded"] * points_config["goals-conceded"]);
        points = points + (stats.penalty_save * points_config["penalty_save"]);
        points = points + Math.floor(stats.saves * points_config["saves"]);
        points = points + (stats.penalty_miss * points_config["penalty_miss"]);
        points = points + (stats.yellowcards * points_config["yellowcards"]);
        points = points + (stats.redcards * points_config["redcards"]);
        points = points + Math.floor(stats.tackles * points_config["tackles"]);
        points = points + (stats.interceptions * points_config["interceptions"]);
        points = points + (stats.bonus * points_config["bonus"]);
        if (points > 0) points = Math.floor(points)
        else points = Math.ceil(points);

        return points;
    } catch (err) {
        console.log("error occurred")
        console.log(err)
        throw err;
    }
}

export default router;
