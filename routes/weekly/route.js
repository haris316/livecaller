import express from 'express';
import axios from 'axios';
import https from 'https';
import { Player, FantasyLeague, FantasyTeam, Team, GameWeek, Match, Standing, User, FantasyAchievement } from '../../models.js';
import mongoose from 'mongoose';
const router = express.Router();

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
                        console.log(form_array);
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
                        console.log("found")
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
                    console.log("still not found")
                    user.achievements.push({
                        achievement: new mongoose.Types.ObjectId(ach._id),
                        unlocked: true,
                        count: ach_count
                    })
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

router.get('/players', async (req, res) => {
    try {
        let bulkOps = [];
        const seasonID = process.env.NEXT_PUBLIC_SEASON_ID
        const api_url = "https://api.sportmonks.com/v3/football/players/"
        const url_options = "?include=statistics.details;"
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        axios.defaults.httpsAgent = agent
        let playerIDs = await Player.find({})
        playerIDs = playerIDs.map((player) => {
            return {
                playerID: player.id,
                teamID: player.teamID,
            }
        })
        for (const player of playerIDs) {
            try {
                const playerID = player.playerID;
                const full_URL = api_url + playerID + url_options;
                // console.log("full_URL : " + full_URL)
                const response = await axios.get(full_URL, {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
                    },
                    agent: agent
                });

                if (response.status !== 200) {
                    console.log(`Failed to fetch data for player ${playerID}`);
                    continue;
                }
                const player_data = response.data.data;
                const rating = player_data?.statistics?.filter(i => i.season_id == seasonID)[0]?.details?.filter(i => i.type_id == 118)[0]?.value?.average || 0;
                if (rating != 0) {
                    console.log(`Updating rating for ${player_data.name}: ${rating}`);
                    bulkOps.push({
                        updateOne: {
                            filter: { id: player.playerID },
                            update: { $set: { rating: rating } }
                        }
                    });
                }
                // Execute batch update
                if (bulkOps.length > 50) {
                    await Player.bulkWrite(bulkOps);
                    console.log(`Updated ratings for ${bulkOps.length} players.`);
                    bulkOps = [];
                }
            } catch {
                console.log("Some error with")
                console.log(player)
                console.log("Continuing ahead...")
                continue
            }
        }
        // Execute batch update
        if (bulkOps.length > 0) {
            await Player.bulkWrite(bulkOps);
            console.log(`Updated ratings for ${bulkOps.length} players.`);
        }
        return res.status(200).json({
            error: false,
            message: `Updated ratings for players successfully.`
        });

    } catch (err) {
        console.log(err);
        return res.status(200).json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }

});

export default router;