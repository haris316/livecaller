import express from 'express';
import axios from 'axios';
import https from 'https';
import { Player, FantasyLeague, FantasyTeam, Team, GameWeek, Match, Standing, User, FantasyAchievement, FantasyDraft } from '../../models.js';
import mongoose from 'mongoose';
const router = express.Router();
import { calculateTeamPoints } from '../../helpers.js';


// ACHIEVEMENTS
router.get('/unstoppable', async (req, res) => {
    try {
        // Parameter to set number of wins required
        const win_number = 8;
        let ach = await FantasyAchievement.findOne({ name: "UNSTOPPABLE" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, 'league_configuration.format': 'Head to Head' }).populate("head_to_head_points.team")
            for (const league of leagues) {
                console.log(" Processing league: " + league.league_name);
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    // console.log("user email : "+user.email)
                    // console.log(team.team.user_email);
                    // console.log("team email : "+team.user_email)
                    if (team.team.user_email === user.email) {
                        // Convert form to array and check the form of the team for number of consecutive wins
                        let form_array = team.form.split(" ");
                        // console.log(form_array);
                        let win_count = 0;
                        for (const form of form_array) {
                            // If win, increase win_count
                            if (form === "W") win_count++;
                            // else reset win_count
                            else win_count = 0
                            // If win_count reaches win_number, increase ach_count and reset win_count
                            if (win_count === win_number) {
                                ach_count++;
                                win_count = 0;
                            }
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    // console.log(ach_obj)
                    // console.log(ach)
                    if (ach_obj.achievement.name === ach.name) {
                        // console.log("found")
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
                    // console.log("still not found")
                    user.achievements.push({
                        achievement: new mongoose.Types.ObjectId(ach._id),
                        unlocked: true,
                        count: ach_count
                    })
                }
            } else {
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_obj.unlocked = false;
                        ach_obj.count = 0;
                    }
                }
            }
            // Save user
            await user.save();
        }
        return res.status(200).json({
            error: false,
            message: "UNSTOPPABLE - Processed Successfully.",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
})
router.get('/king', async (req, res) => {
    try {
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "KING" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, })
            for (const league of leagues) {
                console.log(" Processing league: " + league.league_name);
                // Fetch user's team in the league
                if (league.winner && league.winner === user.email) ach_count = ach_count + 1;
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    // console.log(ach_obj)
                    // console.log(ach)
                    if (ach_obj.achievement.name === ach.name) {
                        // console.log("found")
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
                    // console.log("still not found")
                    user.achievements.push({
                        achievement: new mongoose.Types.ObjectId(ach._id),
                        unlocked: true,
                        count: ach_count
                    })
                }
            } else {
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_obj.unlocked = false;
                        ach_obj.count = 0;
                    }
                }
            }
            // Save user
            await user.save();
        }
        return res.status(200).json({
            error: false,
            message: "KING - Processed Successfully.",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
})
router.get('/bin_man', async (req, res) => {
    try {
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "BIN MAN" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, })
            for (const league of leagues) {
                console.log(" Processing league: " + league.league_name);
                // Fetch user's team in the league
                if (league.winner !== null && league.winner !== user.email) ach_count = ach_count + 1;
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    // console.log(ach_obj)
                    // console.log(ach)
                    if (ach_obj.achievement.name === ach.name) {
                        // console.log("found")
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
                    // console.log("still not found")
                    user.achievements.push({
                        achievement: new mongoose.Types.ObjectId(ach._id),
                        unlocked: true,
                        count: ach_count
                    })
                }
            } else {
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_obj.unlocked = false;
                        ach_obj.count = 0;
                    }
                }
            }
            // Save user
            await user.save();
        }
        return res.status(200).json({
            error: false,
            message: "BIN MAN - Processed Successfully.",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
})
router.get('/destroyer', async (req, res) => {
    try {
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "DESTROYER" });
        let last_gameweek = null;
        let curr_gameweek = await GameWeek.findOne({ is_current: true });
        if (!curr_gameweek) {
            return res.status(200).json({
                error: true,
                message: "No current game week found.",
            });
        } else {
            let last_gameweek_num = parseInt(curr_gameweek.name) - 1;
            last_gameweek = await GameWeek.findOne({ name: "" + last_gameweek_num });
        }
        if (last_gameweek) {
            // Fetch all users and parse one by one
            let users = await User.find({}).populate("achievements.achievement");
            for (const user of users) {
                console.log("Processing user: " + user.email);
                let ach_count = 0;
                // Fetch all leagues where user is present
                let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, 'league_configuration.format': 'Head to Head' }).populate("draftID")
                for (const league of leagues) {
                    if (league.draftID.state === "Ended") {
                        console.log(" Processing league: " + league.league_name);
                        // console.log(league.draftID)
                        // console.log(league.league_fixtures)
                        for (const fixture of league.league_fixtures) {
                            if (fixture.gameweek === last_gameweek.name) {
                                // console.log(fixture);
                                let user_team = null;
                                let opp_team = null;
                                let team1 = FantasyTeam.findOne({ _id: fixture.teams[0] });
                                let team2 = FantasyTeam.findOne({ _id: fixture.teams[1] });
                                if (team1 && team2) {
                                    if (team1.user_email === user.email) {
                                        user_team = team1
                                        opp_team = team2
                                    }
                                    else if (team2.user_email === user.email) {
                                        user_team = team2
                                        opp_team = team1
                                    }
                                    if (user_team && opp_team) {
                                        let user_points = calculateTeamPoints(league, user_team, last_gameweek)
                                        let opp_points = calculateTeamPoints(league, opp_team, last_gameweek)
                                        if ((user_points > (2 * opp_points))) {
                                            ach_count = ach_count + 1;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
                if (ach_count > 0) {
                    let ach_found = false
                    for (const ach_obj of user.achievements) {
                        // console.log(ach_obj)
                        // console.log(ach)
                        if (ach_obj.achievement.name === ach.name) {
                            // console.log("found")
                            ach_found = true;
                            ach_obj.unlocked = true;
                            ach_obj.count = ach_obj.count + ach_count;
                        }
                    }
                    if (!ach_found) {
                        // console.log("still not found")
                        user.achievements.push({
                            achievement: new mongoose.Types.ObjectId(ach._id),
                            unlocked: true,
                            count: ach_count
                        })
                    }
                    // Save user
                    await user.save();
                }
            }
        } else {
            return res.status(200).json({
                error: true,
                message: "No last game week found.",
            });
        }
        return res.status(200).json({
            error: false,
            message: "DESTROYER - Processed Successfully.",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
})
router.get('/punch_bag', async (req, res) => {
    try {
        // Parameter to set number of wins required
        const lose_number = 8;
        let ach = await FantasyAchievement.findOne({ name: "PUNCH BAG" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, 'league_configuration.format': 'Head to Head' }).populate("head_to_head_points.team")
            for (const league of leagues) {
                console.log(" Processing league: " + league.league_name);
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    // console.log("user email : "+user.email)
                    // console.log(team.team.user_email);
                    // console.log("team email : "+team.user_email)
                    if (team.team.user_email === user.email) {
                        // Convert form to array and check the form of the team for number of consecutive loses
                        let form_array = team.form.split(" ");
                        // console.log(form_array);
                        let lose_count = 0;
                        for (const form of form_array) {
                            // If lose, increase lose_count
                            if (form === "L") lose_count++;
                            // else reset lose_count
                            else lose_count = 0
                            // If lose_count reaches lose_number, increase ach_count and reset lose_count
                            if (lose_count === lose_number) {
                                ach_count++;
                                lose_count = 0;
                            }
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    // console.log(ach_obj)
                    // console.log(ach)
                    if (ach_obj.achievement.name === ach.name) {
                        // console.log("found")
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
                    // console.log("still not found")
                    user.achievements.push({
                        achievement: new mongoose.Types.ObjectId(ach._id),
                        unlocked: true,
                        count: ach_count
                    })
                }
            } else {
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_obj.unlocked = false;
                        ach_obj.count = 0;
                    }
                }
            }
            // Save user
            await user.save();
        }
        return res.status(200).json({
            error: false,
            message: "PUNCHBAG - Processed Successfully.",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
})
router.get('/early_bird', async (req, res) => {
    try {
        let ach = await FantasyAchievement.findOne({ name: "EARLY BIRD" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false }).populate("draftID")
            for (const league of leagues) {
                console.log(" Processing league: " + league.league_name);
                // Fetch user's team in the league
                if (league.draftID.state === "Ended") {
                    ach_count = ach_count + 1;
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    // console.log(ach_obj)
                    // console.log(ach)
                    if (ach_obj.achievement.name === ach.name) {
                        // console.log("found")
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
                    // console.log("still not found")
                    user.achievements.push({
                        achievement: new mongoose.Types.ObjectId(ach._id),
                        unlocked: true,
                        count: ach_count
                    })
                }
            } else {
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_obj.unlocked = false;
                        ach_obj.count = 0;
                    }
                }
            }
            // Save user
            await user.save();
        }
        return res.status(200).json({
            error: false,
            message: "EARLY BIRD - Processed Successfully.",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
})
router.get('/politician', async (req, res) => {
    try {
        // Parameter to set number of wins required
        const draw_number = 4;
        let ach = await FantasyAchievement.findOne({ name: "POLITICIAN" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, 'league_configuration.format': 'Head to Head' }).populate("head_to_head_points.team")
            for (const league of leagues) {
                console.log(" Processing league: " + league.league_name);
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    // console.log("user email : "+user.email)
                    // console.log(team.team.user_email);
                    // console.log("team email : "+team.user_email)
                    if (team.team.user_email === user.email) {
                        // Convert form to array and check the form of the team for number of consecutive draws
                        let form_array = team.form.split(" ");
                        // console.log(form_array);
                        let draw_count = 0;
                        for (const form of form_array) {
                            // If draw, increase draw_count
                            if (form === "D") draw_count++;
                            // If draw_count reaches draw_number, increase ach_count and reset draw_count
                            if (draw_count === draw_number) {
                                ach_count++;
                                draw_count = 0;
                            }
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    // console.log(ach_obj)
                    // console.log(ach)
                    if (ach_obj.achievement.name === ach.name) {
                        // console.log("found")
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
                    // console.log("still not found")
                    user.achievements.push({
                        achievement: new mongoose.Types.ObjectId(ach._id),
                        unlocked: true,
                        count: ach_count
                    })
                }
            } else {
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_obj.unlocked = false;
                        ach_obj.count = 0;
                    }
                }
            }
            // Save user
            await user.save();
        }
        return res.status(200).json({
            error: false,
            message: "POLITICIAN - Processed Successfully.",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
})
router.get('/rocketman', async (req, res) => {
    try {
        // Parameter to set number of wins required
        let win_points = 2000;
        let ach = await FantasyAchievement.findOne({ name: "ROCKETMAN" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");

        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            gameweeks = gameweeks.slice(0, currentGameweekIndex + 1);
        }

        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false }).populate("draftID").populate("teams.team")
            for (const league of leagues) {
                if (league.draftID.state === "Ended") {
                    console.log(" Processing league: " + league.league_name);
                    let points_sum = 0;
                    let user_team = null;
                    league.teams.map((item) => {
                        if (item.user_email === user.email) user_team = item.team;
                    })
                    for (const gameweek of gameweeks) {
                        let cur_gw_points = await calculateTeamPoints(league, user_team, gameweek);
                        points_sum = points_sum + cur_gw_points;
                        console.log(gameweek.name);
                        console.log(points_sum);
                    }
                    if (points_sum >= win_points) ach_count = ach_count + 1;
                }
            }

            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    // console.log(ach_obj)
                    // console.log(ach)
                    if (ach_obj.achievement.name === ach.name) {
                        // console.log("found")
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
                    // console.log("still not found")
                    user.achievements.push({
                        achievement: new mongoose.Types.ObjectId(ach._id),
                        unlocked: true,
                        count: ach_count
                    })
                }
                // Save user
                await user.save();
            } else {
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_obj.unlocked = false;
                        ach_obj.count = 0;
                    }
                }
                // Save user
                await user.save();
            }
        }
        return res.status(200).json({
            error: false,
            message: "ROCKETMAN - Processed Successfully.",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
})
// Update player details
router.get('/players', async (req, res) => {
    try {
        // Initiate Variables
        let bulkOps = [];
        const seasonID = process.env.NEXT_PUBLIC_SEASON_ID
        const players_api_url = "https://api.sportmonks.com/v3/football/players/"
        const team_api_url = "https://api.sportmonks.com/v3/football/teams/seasons/"
        const url_options = "?include=statistics.details;"
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        axios.defaults.httpsAgent = agent

        // Updating teams
        let full_URL = team_api_url + seasonID + "?include=players;"
        let team_data = [];
        let response = await axios.get(full_URL, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
            },
            agent: agent
        })
        if (response.status === 200) {
            team_data = response.data.data;
        } else {
            return res.status(200).json({
                error: true,
                message: "Line : 653, no teams found."
            });
        }
        for (const team of team_data) {
            const query = {
                id: team.id,
                seasonID: Number(seasonID),
                name: team.name,
                short_code: team.short_code,
                image_path: team.image_path,
                players: team.players.map((player) => { return player.player_id })
            };
            console.log(query.name);
            const res = await Team.updateOne({ id: team.id }, { $set: query }, { upsert: true });
        }

        // Updating players
        let data_to_insert = [];
        const teams = await Team.find({})
        const all_players = await Player.find({})
        const all_players_ids = all_players.map((player) => player.id);
        const gameweek = await GameWeek.find({ seasonID: seasonID })
        const playerIDs = []
        teams.map((team) => {
            team.players.map((player) => {
                playerIDs.push({
                    playerID: player,
                    teamID: team.id,
                    team_name: team.name,
                    team_image_path: team.image_path
                })
            })
        })
        for (const player of playerIDs) {
            try {
                let full_URL = players_api_url + player.playerID + url_options
                let response = await axios.get(full_URL, {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
                    },
                    agent: agent
                })
                if (response.status !== 200) {
                    console.log("Line : 702, Failed to fetch data from API for :" + player.playerID);
                    continue;
                }
                let player_data = response.data.data;
                console.log(all_players_ids.indexOf(player_data?.id));
                console.log(player_data?.name);
                if (all_players_ids.indexOf(player_data?.id) != -1) {
                    const player_to_update = {
                        id: player_data?.id,
                        name: player_data?.name,
                        common_name: player_data?.common_name,
                        image_path: player_data?.image_path,
                        nationality: player_data?.nationality?.name,
                        nationality_image_path: player_data?.nationality?.image_path,
                        positionID: player_data?.position?.id,
                        position_name: player_data?.position?.name,
                        detailed_position: player_data?.detailedposition?.name,
                        teamID: player?.teamID,
                        team_name: player?.team_name,
                        team_image_path: player?.team_image_path,
                    };
                    const existing_player = all_players.find(p => p.id === player_to_update.id);
                    if (existing_player) {
                        const changed_fields = Object.keys(player_to_update).filter(key => existing_player[key] !== player_to_update[key]);
                        if (changed_fields.length > 0) {
                            console.log(`Updating ${changed_fields.length} fields for ${player_to_update.name}: ${changed_fields.join(", ")}`);
                            bulkOps.push({
                                updateOne: {
                                    filter: { id: player_to_update.id },
                                    update: { $set: player_to_update }
                                }
                            });
                        }
                    }
                    // Execute batch update
                    if (bulkOps.length > 50) {
                        await Player.bulkWrite(bulkOps);
                        console.log(`Updated ratings for ${bulkOps.length} players.`);
                        bulkOps = [];
                    }
                } else {
                    let player_points = [];
                    gameweek.forEach((gw) => {
                        let points_obj = {
                            status: "Not Started",
                            seasonID: seasonID,
                            gameweek: gw._id,
                            points: null,
                            fpl_stats: null
                        }
                        player_points.push(points_obj);
                    })

                    const query = {
                        "id": player_data?.id,
                        "name": player_data?.name,
                        "common_name": player_data?.common_name,
                        "image_path": player_data?.image_path,
                        "nationality": player_data?.nationality?.name,
                        "nationality_image_path": player_data?.nationality?.image_path,
                        "positionID": player_data?.position?.id,
                        "position_name": player_data?.position?.name,
                        "detailed_position": player_data?.detailedposition?.name,
                        "teamID": player?.teamID,
                        "team_name": player?.team_name,
                        "team_image_path": player?.team_image_path,
                        "rating": player_data?.statistics?.filter(i => i.season_id == seasonID)[0]?.details?.filter(i => i.type_id == 118)[0]?.value?.average || 0,
                        "points": player_points,
                    };
                    console.log("New player");
                    console.log(query.name);
                    const res = await Player.updateOne({ id: query.id }, { $set: query }, { upsert: true });
                }
            } catch (error) {
                console.log(error);
                console.log("Line :774, Some error with")
                console.log(player)
                console.log("Continuing ahead...")
                continue;
            }
        }
        if (bulkOps.length > 0) {
            await Player.bulkWrite(bulkOps);
            console.log(`Updated ratings for ${bulkOps.length} players.`);
            bulkOps = [];
        }
        return res.status(200).json({
            error: false,
            message: `Updated players successfully.`
        });

        // // Old Players Update
        // let playerIDs = await Player.find({})
        // playerIDs = playerIDs.map((player) => {
        //     return {
        //         playerID: player.id,
        //         teamID: player.teamID,
        //     }
        // })
        // for (const player of playerIDs) {
        //     try {
        //         const playerID = player.playerID;
        //         const full_URL = api_url + playerID + url_options;
        //         const response = await axios.get(full_URL, {
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 "Accept": "application/json",
        //                 "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
        //             },
        //             agent: agent
        //         });
        //         if (response.status !== 200) {
        //             console.log(`Failed to fetch data for player ${playerID}`);
        //             continue;
        //         }
        //         const player_data = response.data.data;
        //         const rating = player_data?.statistics?.filter(i => i.season_id == seasonID)[0]?.details?.filter(i => i.type_id == 118)[0]?.value?.average || 0;
        //         if (rating != 0) {
        //             console.log(`Updating rating for ${player_data.name}: ${rating}`);
        //             bulkOps.push({
        //                 updateOne: {
        //                     filter: { id: player.playerID },
        //                     update: { $set: { rating: rating } }
        //                 }
        //             });
        //         }
        //         // Execute batch update
        //         if (bulkOps.length > 50) {
        //             await Player.bulkWrite(bulkOps);
        //             console.log(`Updated ratings for ${bulkOps.length} players.`);
        //             bulkOps = [];
        //         }
        //     } catch {
        //         console.log("Some error with")
        //         console.log(player)
        //         console.log("Continuing ahead...")
        //         continue
        //     }
        // }
        // // Execute batch update
        // if (bulkOps.length > 0) {
        //     await Player.bulkWrite(bulkOps);
        //     console.log(`Updated ratings for ${bulkOps.length} players.`);
        // }
        // return res.status(200).json({
        //     error: false,
        //     message: `Updated ratings for players successfully.`
        // });

    } catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }

});

export default router;