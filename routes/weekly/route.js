import express from 'express';
import { Match, Player } from '../../models.js';
const router = express.Router();

router.get('/', async (req, res) => {
    // Getting current season ID
    const seasonID = process.env.NEXT_PUBLIC_SEASON_ID

    //Getting Matches update recently
    let minutes_since_last_update = new Date(Date.now() - 1000 * 60 * 60 * 30);

    let matchesUpdated = await Match.find({
        updatedAt: { $gte: minutes_since_last_update }
    })
    if (matchesUpdated && matchesUpdated.length > 0) {
        let players_updated = matchesUpdated.map((match) => {
            let match_gameweek_id = match.gameweekID;
            return match.lineups.map((lineup) => {
                let lineup_obj = {}
                lineup_obj.gameweekID = match_gameweek_id;
                lineup_obj.item = lineup;
                return lineup_obj;
            })
        }).flat()

        let points_config = [
            "goals",
            "assists",
            "clean-sheet",
            "goals-conceded",
            "penalty_save",
            "saves",
            "penalty_miss",
            "yellowcards",
            "redcards",
            "minutes-played",
            "tackles",
            "interceptions"
        ]
        let players_fpl = []
        players_updated.forEach((player) => {
            let player_stats = player.item.statistics;
            let fpl_stats = {
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
            if (player_stats && player_stats.length > 0) {
                player_stats.forEach((stat) => {
                    if (points_config.indexOf(stat.code) !== -1) {
                        fpl_stats[stat.code] = stat.value;
                    }
                })
            }
            if ((fpl_stats["goals-conceded"] === 0) && (fpl_stats["minutes-played"] > 60)) fpl_stats["clean-sheet"] = 1;
            // console.log(player.item.player_name);
            // console.log(fpl_stats);
            // console.log("XXXXXXXXXXXX");
            player.item.fpl_stats = fpl_stats;
            players_fpl.push({
                _id: player.item._id,
                player_id: player.item.player_id,
                name: player.item.player_name,
                gameweekID: player.gameweekID,
                fpl_stats: fpl_stats
            })
        })


        // let currentGameWeek = await GameWeek.findOne({ is_current: true })
        let allPlayers = await Player.find({}).populate("points.gameweek")


        allPlayers.forEach(async (player) => {
            // console.log(player.name);
            let player_fpl = players_fpl.find((player_fpl) => player_fpl.player_id == player.id)
            if (player_fpl) {
                let playerGameWeek = player.points.find((item) => ((item.gameweek.id == player_fpl.gameweekID) && (item.seasonID == seasonID)))
                if (playerGameWeek) {
                    playerGameWeek.fpl_stats = player_fpl.fpl_stats;
                    let temp_points = 0;
                    if (player_fpl.fpl_stats["minutes-played"] > 60) temp_points = temp_points + 2
                    else if (player_fpl.fpl_stats["minutes-played"] > 30) temp_points = temp_points + 1
                    temp_points = temp_points + (player_fpl.fpl_stats.goals * 5);
                    temp_points = temp_points + (player_fpl.fpl_stats.assists * 3);
                    if (player.position_name == "Goalkeeper" || player.position_name == "Defender") temp_points = temp_points + (player_fpl.fpl_stats["clean-sheet"] * 4);
                    if (player.position_name == "Goalkeeper" || player.position_name == "Defender") temp_points = temp_points + (player_fpl.fpl_stats["goals-conceded"] * -1);
                    temp_points = temp_points + (player_fpl.fpl_stats.penalty_save * 5);
                    temp_points = temp_points + Math.floor(player_fpl.fpl_stats.saves * 0.333);
                    temp_points = temp_points + (player_fpl.fpl_stats.penalty_miss * -3);
                    temp_points = temp_points + (player_fpl.fpl_stats.yellowcards * -1);
                    temp_points = temp_points + (player_fpl.fpl_stats.redcards * -3);
                    temp_points = temp_points + Math.floor(player_fpl.fpl_stats.tackles * 0.2);
                    temp_points = temp_points + (player_fpl.fpl_stats.interceptions * 0.2);
                    temp_points = temp_points + (player_fpl.fpl_stats.bonus);
                    if (temp_points > 0) temp_points = Math.floor(temp_points)
                    else temp_points = Math.ceil(temp_points);
                    playerGameWeek.points = temp_points;
                }
                let res = await player.save();
            }
        })
    }
    // }
    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //End of Call
    return res.status(200).json({
        error: "maybe",
        message: "done"
    });
});

export default router;