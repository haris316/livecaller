import express from 'express';
import axios from 'axios';
import https from 'https';
import { Player, FantasyLeague, FantasyTeam, Team, GameWeek, Match, Standing } from '../../models.js';
const router = express.Router();

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
            message: `Updated ratings for ${bulkOps.length} players.`
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