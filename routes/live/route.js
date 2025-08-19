// import { GameWeek, Match, Standing } from "@/lib/models";
// import { connectToDb } from "@/lib/utils";
// import { NextResponse } from "next/server";
// import https from "https";
// import axios from "axios";

// export const dynamic = 'force-dynamic'

import express from 'express';
import axios from 'axios';
import https from 'https'; 
import { GameWeek, Match, Standing } from '../../models.js';
const router = express.Router();

router.get('/', async (req, res) => {    
    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //Updating Scores
    console.log("Updating Scores");
    try {
        // let db = await connectToDb();
        const api_url = "https://api.sportmonks.com/v3/football/livescores?include=round;stage;league;venue;state;lineups.details.type;events;timeline;statistics;periods;participants;scores;"
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        axios.defaults.httpsAgent = agent
        let full_URL = api_url
        let match_data = [];
        let response = await axios.get(full_URL, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
            },
            agent: agent
        })
        if (response.status === 200) {
            if (response.data && response.data.data) {
                match_data = response.data;
                const match_array = match_data.data;

                for (const match of match_array) {
                    // LINE-UPS
                    const lineups = match.lineups.map(lineup => ({
                        player_id: lineup.player_id,
                        player_name: lineup.player_name,
                        team_id: lineup.team_id,
                        team_name: match.participants.find(x => x.id === lineup.team_id).name,
                        position_id: lineup.position_id,
                        position_name: event_type_ids[lineup.position_id] || "Unknown",
                        formation_position: lineup.formation_position,
                        jersey_number: lineup.jersey_number,
                        statistics: lineup.details.map((stat) => {
                            return {
                                value: Number(stat?.data?.value) || null,
                                name: stat?.type?.name || null,
                                code: stat?.type?.code || null
                            }
                        })
                    }));

                    // EVENTS
                    const events = match.events.map(event => ({
                        team_id: event.participant_id,
                        team_name: match.participants.find(x => x.id === event.participant_id).name,
                        event_id: event.type_id,
                        event_name: event_type_ids[event.type_id] || "Unknown",
                        player_id: event.player_id,
                        player_name: event.player_name,
                        related_player_id: event.related_player_id,
                        related_player_name: event.related_player_name,
                        result: event.result,
                        info: event.info,
                        addition: event.addition,
                        minute: event.minute,
                        sort_order: event.sort_order,
                    }));

                    // TEAMS
                    const teams = match.participants.map(team => {
                        let team_short_code = team.short_code;
                        if (!team_short_code) {
                            team_short_code = team.name.slice(0, 3).toUpperCase();
                        }

                        return {
                            team_id: team.id,
                            team_name: team.name,
                            short_code: team_short_code,
                            image_path: team.image_path,
                            location: team.meta.location,
                            winner: team.meta.winner,
                        };
                    });

                    // SCORES
                    const scores = match.scores.map(score => ({
                        score_type_id: score.type_id,
                        score_type_name: event_type_ids[score.type_id] || "Unknown",
                        team_id: score.participant_id,
                        team_name: match.participants.find(x => x.id === score.participant_id).name,
                        team_type: score.score.participant,
                        goals: score.score.goals,
                    }));

                    // Consolidating data into QUERY Object
                    const query = {
                        id: match.id,
                        seasonID: Number(process.env.NEXT_PUBLIC_SEASON_ID),
                        gameweekID: match.round.id,
                        gameweekName: match.round.name,
                        name: match.name,
                        starting_at: match.starting_at,
                        result_info: match.result_info,
                        state: match.state.name,
                        lineups: lineups,
                        events: events,
                        teams: teams,
                        scores: scores,
                    };
                    // db = await connectToDb();
                    const res = await Match.updateOne({ id: match.id }, { $set: query }, { upsert: true });
                }
                console.log("done")
            } else {
                console.log("no match being played")
            }
        } else {
            console.log("Failed to fetch data from API");
        }
    } catch (err) {
        console.log(err);
        console.log("An unexpected error occurred while updating the scores. Please try again.");
    }

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //Updating Standings
    console.log("Updating Standings");
    try {
        const api_url = "https://api.sportmonks.com/v3/football/standings/live/leagues/" + process.env.NEXT_PUBLIC_LEAGUE_ID + "?&include=form;participant;"
        const api_url2 = "https://api.sportmonks.com/v3/football/teams/seasons/" + process.env.NEXT_PUBLIC_SEASON_ID + "?include=statistics.details&filters=teamstatisticSeasons:" + process.env.NEXT_PUBLIC_SEASON_ID
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        axios.defaults.httpsAgent = agent
        let standing_response = await axios.get(api_url, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
            },
            agent: agent
        })
        let statistic_response = await axios.get(api_url2, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
            },
            agent: agent
        })

        // Code to check response if need be :
        // console.log("statistic_response");
        // console.log(statistic_response);
        // console.log("standing_response");
        // console.log(standing_response);
        // return res.status(200).json({
        //     statistic_response: statistic_response,
        //     standing_response: standing_response,
        // });

        if (standing_response.status === 200 && statistic_response.status === 200) {
            if (standing_response.data && standing_response.data.data && statistic_response.data && statistic_response.data.data) {
                const team_array = standing_response.data.data;
                for (const team of team_array) {
                    let form = []
                    for (const form_item of team.form) {
                        form.push({
                            form: form_item.form,
                            sort_order: form_item.sort_order
                        })
                    }
                    let stats = statistic_response.data.data.filter((item) => item.id == team.participant.id)[0].statistics[0].details
                    console.log(team.participant.name);
                    let standing = {
                        "id": team.participant.id,
                        "name": team.participant.name,
                        "short_code": team.participant.short_code,
                        "image_path": team.participant.image_path,
                        "points": team.points,
                        "position": team.position,
                        "form": form,
                        "rating": stats.filter((item) => item.type_id == 118)[0]?.value?.value,
                        "scoring_frequency": stats.filter((item) => item.type_id == 27248)[0]?.value.scoring_frequency,
                        "lost": stats.filter((item) => item.type_id == 216)[0]?.value.all.count,
                        "games_played": stats.filter((item) => item.type_id == 27263)[0]?.value.total,
                        "draws": stats.filter((item) => item.type_id == 215)[0]?.value.all.count,
                        "goals_conceded": stats.filter((item) => item.type_id == 88)[0]?.value.all.count,
                        "goals_scored": stats.filter((item) => item.type_id == 52)[0]?.value.all.count,
                        "wins": stats.filter((item) => item.type_id == 214)[0]?.value.all.count,
                        "cleansheets": stats.filter((item) => item.type_id == 194)[0]?.value.all.count,
                    }
                    // await connectToDb();
                    // console.log(standing)
                    const res = await Standing.updateOne({ id: standing.id }, { $set: standing }, { upsert: true });
                }
            } else {
                console.log("no standing data found")
            }
        } else {
            console.log("Failed to fetch data from API");
        }
    } catch (err) {
        console.log(err);
        console.log("An unexpected error occurred while updating the scores. Please try again.");
    }

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //End of Call
    return res.status(200).json({
        error: "maybe",
        message: "done"
    });
    // res.status(200).json({ message: "Test route is working!" });
  });

export default router;
