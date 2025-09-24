import express from 'express';
import { Player, FantasyLeague, FantasyTeam, Team, GameWeek, Match, Standing, User, FantasyAchievement } from './models.js';
import mongoose from 'mongoose';


export const calculatePlayerPoints = async (league, player, gameweek) => {
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
    try {
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
    } catch (err) {
        console.log("error occurred")
        console.log(err)
    }
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
}

export const calculateTeamPoints = async (league, team, gameweek) => {
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
                // console.log("player in team");
                // console.log(playerObj);
                let playerDetails = await Player.findOne({ _id: playerObj.player });
                // console.log("playerDetails")
                // console.log(playerDetails)
                if (playerDetails) {
                    let playerPoints = await calculatePlayerPoints(league, playerDetails, gameweek);
                    // console.log("playerPoints")
                    // console.log(playerDetails.name)
                    // console.log(playerPoints)
                    if (!isNaN(playerPoints)) {
                        // console.log("inside nan condition")
                        // if (playerObj.captain) { playerPoints = playerPoints * 2; }
                        points += playerPoints;
                    }
                    // console.log("new team points")
                    // console.log(points)
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
    }
}

export const calculateTeamAndPlayerPoints = async (league, team, gameweek) => {
    try {
        let team_points = 0;
        let gameweekSquad = team.history.find(item => item.gameweek == gameweek._id)
        if (!gameweekSquad) {
            gameweekSquad = { gameweek: gameweek, players: team.players }
        }
        let output = {
            players: [],
            team: {}
        }
        for (let playerObj of gameweekSquad.players) {
            let playerDetails = await Player.findOne({ _id: playerObj.player });
            if (playerDetails) {
                let playerPoints = await calculatePlayerPoints(league, playerDetails, gameweek);

                if (isNaN(playerPoints)) { playerPoints = 0; }
                if (playerObj.captain) { playerPoints = playerPoints * 2; }
                if (playerObj.in_team) { team_points += playerPoints; }

                output.players.push({
                    playerDetails: playerDetails,
                    playerPoints: playerPoints
                })
            }
        }
        output.team = {
            teamDetails: team,
            teamPoints: team_points
        }
        return output;
    } catch (err) {
        console.log("error occurred");
        console.log(err);
    }
}