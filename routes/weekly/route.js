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
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    if (team.team.user_email === user.email) {
                        // Convert form to array and check the form of the team for number of consecutive wins
                        let form_array = team.form.split(" ");
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
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
                // Fetch user's team in the league
                if (league.winner && league.winner === user.email) ach_count = ach_count + 1;
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
                // Fetch user's team in the league
                if (league.winner !== null && league.winner !== user.email) ach_count = ach_count + 1;
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
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
                        for (const fixture of league.league_fixtures) {
                            if (fixture.gameweek === last_gameweek.name) {
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
                        if (ach_obj.achievement.name === ach.name) {
                            ach_found = true;
                            ach_obj.unlocked = true;
                            ach_obj.count = ach_obj.count + ach_count;
                        }
                    }
                    if (!ach_found) {
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
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    if (team.team.user_email === user.email) {
                        // Convert form to array and check the form of the team for number of consecutive loses
                        let form_array = team.form.split(" ");
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
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
                // Fetch user's team in the league
                if (league.draftID.state === "Ended") {
                    ach_count = ach_count + 1;
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    if (team.team.user_email === user.email) {
                        // Convert form to array and check the form of the team for number of consecutive draws
                        let form_array = team.form.split(" ");
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
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
                    let points_sum = 0;
                    let user_team = null;
                    league.teams.map((item) => {
                        if (item.user_email === user.email) user_team = item.team;
                    })
                    for (const gameweek of gameweeks) {
                        let cur_gw_points = await calculateTeamPoints(league, user_team, gameweek);
                        points_sum = points_sum + cur_gw_points;
                    }
                    if (points_sum >= win_points) ach_count = ach_count + 1;
                }
            }

            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
router.get('/mixologist', async (req, res) => {
    try {
        // Parameter to set number of wins required
        const win_number = 8;
        let ach = await FantasyAchievement.findOne({ name: "MIXOLOGIST" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, 'league_configuration.format': 'Head to Head' }).populate("head_to_head_points.team.players.player")
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    if (team.team.user_email === user.email) {
                        if (team.form.slice(-1) === "W") {
                            let myTeamObj = Team.find({ _id: team.team._id }).populate("players.player");
                            let clubs = myTeamObj.players.map(player => player.teamID);
                            let clubSet = new Set(clubs);
                            if (clubSet.size === myTeamObj.players.length) {
                                ach_count++;
                            }
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "MIXOLOGIST - Processed Successfully.",
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
router.get('/the_ghost', async (req, res) => {
    try {
        let ach = await FantasyAchievement.findOne({ name: "THE GHOST" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false })
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.teams) {
                    let teamID = team.team;
                    let dateToday = new Date.now();
                    let transferArray = await FantasyTransfer.find({ $or: [{ teamInID: teamID }, { teamOutID: teamID }] });
                    if (transferArray.length > 0) {
                        transferArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        for (const transfer of transferArray) {
                            if (transfer.createdAt < (dateToday - (3 * 7 * 24 * 60 * 60 * 1000))) {
                                ach_count++;
                                dateToday = transfer.createdAt;
                            }
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE GHOST - Processed Successfully.",
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
router.get('/targetman', async (req, res) => {
    try {
        // Parameter to set number of wins required
        const win_number = 8;
        let last_gameweek = null;
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
        }
        let ach = await FantasyAchievement.findOne({ name: "TARGETMAN" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false })
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.teams) {
                    if (team.user_email === user.email) {
                        const team = FantasyTeam.find({ _id: team.team }).populate('players.player');
                        let goals = 0;
                        for (const player of team.players) {
                            const points_item = player.player.points.find(item => item.gameweek.equals(last_gameweek._id));
                            goals = goals + points_item.fpl_stats.goals;
                        }
                        if (goals >= win_number) {
                            ach_count++;
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "TARGETMAN - Processed Successfully.",
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
router.get('/dream_catcher', async (req, res) => {
    try {
        let win_number = 4;
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "DREAMCATCHER" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            let teams = await FantasyTeam.find({ user_email: user.email, is_deleted: false }).populate("players.player")
            if (teams.length > 4) {
                let players_count = {};
                for (const team of teams) {
                    for (const player of team.players) {
                        if (players_count[player.player._id]) {
                            players_count[player.player._id] += 1;
                        } else {
                            players_count[player.player._id] = 1;
                        }
                    }
                }
                for (const [player_id, count] of Object.entries(players_count)) {
                    if (count >= win_number) {
                        ach_count++;
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "DREAM CATCHER - Processed Successfully.",
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
router.get('/the_beast', async (req, res) => {
    try {
        let win_number = 21;
        let last_gameweek = null;
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
        }
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "THE BEAST" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            let teams = await FantasyTeam.find({ user_email: user.email, is_deleted: false }).populate("players.player")
            for (const team of teams) {
                for (const player of team.players) {
                    if (player.position_name === 'Defender') {
                        const points_item = player.player.points.find(item => item.gameweek.equals(last_gameweek._id));
                        if (points_item.points > win_number) {
                            ach_count++;
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE BEAST - Processed Successfully.",
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
router.get('/the_nuke', async (req, res) => {
    try {
        let win_number = 26;
        let last_gameweek = null;
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
        }
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "THE NUKE" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            let teams = await FantasyTeam.find({ user_email: user.email, is_deleted: false }).populate("players.player")
            for (const team of teams) {
                for (const player of team.players) {
                    const points_item = player.player.points.find(item => item.gameweek.equals(last_gameweek._id));
                    if (points_item.points > win_number) {
                        ach_count++;
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE NUKE - Processed Successfully.",
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
router.get('/the_relaxed', async (req, res) => {
    try {
        let win_number = 25;
        let last_gameweek = null;
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
        }
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "THE RELAXED" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            let teams = await FantasyTeam.find({ user_email: user.email, is_deleted: false }).populate("players.player")
            for (const team of teams) {
                let sum = 0;
                for (const player of team.players) {
                    if (!player.in_team) {
                        sum = sum + player.player.points.find(item => item.gameweek.equals(last_gameweek._id)).points;
                    }
                }
                if (sum > win_number) {
                    ach_count++;
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE RELAXED - Processed Successfully.",
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
router.get('/the_drowned', async (req, res) => {
    try {
        let win_number = 15;
        let last_gameweek = null;
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
        }
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "THE DROWNED" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            let teams = await FantasyTeam.find({ user_email: user.email, is_deleted: false }).populate("leagueID")
            for (const team of teams) {
                let points = await calculateTeamPoints(team.leagueID, team, last_gameweek);
                if (points < win_number) {
                    ach_count++;
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE DROWNED - Processed Successfully.",
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
router.get('/the_wall', async (req, res) => {
    try {
        // Parameter to set number of wins required
        const win_number = 3;
        let last_gameweek = null;
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
        }
        let ach = await FantasyAchievement.findOne({ name: "THE WALL" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false })
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.teams) {
                    if (team.user_email === user.email) {
                        const team = FantasyTeam.find({ _id: team.team }).populate('players.player');
                        let team_ids = [];
                        // {
                        // teamID:123
                        // clean_sheets:2
                        // }
                        for (const player of team.players) {
                            if (player.in_team) {
                                let clean_sheet = player.player.points.find(item => item.gameweek.equals(last_gameweek._id)).fpl_stats['clean-sheet'];
                                if (clean_sheet) {
                                    const teamIDAlreadyExists = team_ids.some(team_id_obj => team_id_obj.teamID.equals(player.player.teamID));
                                    if (teamIDAlreadyExists) {
                                        const teamIDIndex = team_ids.findIndex(team_id_obj => team_id_obj.teamID.equals(player.player.teamID));
                                        team_ids[teamIDIndex].clean_sheets = team_ids[teamIDIndex].clean_sheets + 1;
                                    } else {
                                        team_ids.push({
                                            teamID: player.player.teamID,
                                            clean_sheets: 1
                                        })
                                    }
                                }
                            }
                        }
                        for (const team_id_obj of team_ids) {
                            if (team_id_obj.clean_sheets >= win_number) {
                                ach_count++;
                            }
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE WALL - Processed Successfully.",
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
router.get('/fortress', async (req, res) => {
    try {
        // Parameter to set number of wins required
        const win_number = 6;
        let last_gameweek = null;
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
        }
        let ach = await FantasyAchievement.findOne({ name: "FORTRESS" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false })
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.teams) {
                    if (team.user_email === user.email) {
                        let clean_sheets_count = 0;
                        const team = FantasyTeam.find({ _id: team.team }).populate('players.player');
                        for (const player of team.players) {
                            if (player.in_team && (player.player.position_name === 'Goalkeeper' || player.player.position_name === 'Defender')) {
                                let clean_sheet = player.player.points.find(item => item.gameweek.equals(last_gameweek._id)).fpl_stats['clean-sheet'];
                                if (clean_sheet) {
                                    clean_sheets_count++;
                                }
                            }
                        }
                        if (clean_sheets_count >= win_number) {
                            ach_count++;
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "FORTRESS - Processed Successfully.",
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
router.get('/reaper', async (req, res) => {
    try {
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "REAPER" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, 'league_configuration.format': 'Head to Head' })
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    if (team.team.user_email === user.email) {
                        my_team = team;
                        let all_opp_team = league.head_to_head_points.filter(item => item.team.user_email !== user.email);
                        for (const opp_team of all_opp_team) {
                            // check if my team has won against the opponent in every match
                            let fixtures = league.fixtures.filter(item => item.teams[0].equals(opp_team.team._id) || item.teams[1].equals(opp_team.team._id))
                            let won_all = true;
                            for (const fixture of fixtures) {
                                if (lose === my_team.team._id) {
                                    won_all = false;
                                }
                            }
                            if (won_all) {
                                ach_count++;
                            }
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "REAPER - Processed Successfully.",
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
router.get('/the_wizard', async (req, res) => {
    try {
        // Parameter to set number of wins required
        let win_points = 2000;
        let ach = await FantasyAchievement.findOne({ name: "THE WIZARD" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");

        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            gameweeks = gameweeks.slice(0, currentGameweekIndex);
        }

        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false }).populate("draftID").populate("teams.team")
            for (const league of leagues) {
                if (league.draftID.state === "Ended") {
                    let points_sum = 0;
                    let user_team = null;
                    league.teams.map((item) => {
                        if (item.user_email === user.email) user_team = item.team;
                    })
                    for (const gameweek of gameweeks) {
                        let cur_gw_points = await calculateTeamPoints(league, user_team, gameweek);
                        points_sum = points_sum + cur_gw_points;
                    }
                    let avg = points_sum / gameweeks.length
                    if (avg >= win_points) ach_count++;
                }
            }

            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE WIZARD - Processed Successfully.",
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
router.get('/the-savage', async (req, res) => {
    try {
        let ach = await FantasyAchievement.findOne({ name: "THE SAVAGE" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, 'league_configuration.format': 'Head to Head' }).populate("head_to_head_points.team")
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.head_to_head_points) {
                    if (team.team.user_email === user.email) {
                        // Convert form to array and check the form of the team for number of consecutive wins
                        let form_array = team.form.split(" ");
                        let win_number = league.teams.length;
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
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE SAVAGE - Processed Successfully.",
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
router.get('/the_tinkerman', async (req, res) => {
    try {
        let ach = await FantasyAchievement.findOne({ name: "THE TINKERMAN" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false })
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.teams) {
                    let teamID = team.team;
                    let dateToday = new Date.now();
                    let transferArray = await FantasyTransfer.find({ $or: [{ teamInID: teamID }, { teamOutID: teamID }] });
                    if (transferArray.length > 0) {
                        transferArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        let transfer_count = 0;
                        for (const transfer of transferArray) {
                            if (transfer.createdAt > (dateToday - (1 * 7 * 24 * 60 * 60 * 1000))) {
                                transfer_count++;
                            } else {
                                dateToday = transfer.createdAt;
                            }
                            if (transfer_count > 7) {
                                ach_count++;
                                transfer_count = 0;
                            }
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE TINKERMAN - Processed Successfully.",
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
router.get('/the_collector', async (req, res) => {
    try {
        let win_number = 200;
        let ach = await FantasyAchievement.findOne({ name: "THE COLLECTOR" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present and format is H2H
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false })
            for (const league of leagues) {
                // Fetch user's team in the league
                for (const team of league.teams) {
                    let teamID = team.team;
                    let transferArray = await FantasyTransfer.find({ $or: [{ teamInID: teamID }, { teamOutID: teamID }] });
                    if (transferArray.length > win_number) {
                        ach_count++;
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE COLLECTOR - Processed Successfully.",
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
router.get('/the_spineless', async (req, res) => {
    try {
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "THE SPINELESS" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            // Fetch all leagues where user is present
            let leagues = await FantasyLeague.find({ users_onboard: user.email, is_deleted: false, }).populate("head_to_head_points.team").populate("classic_points.team")
            for (const league of leagues) {
                // Fetch user's team in the league
                if (league.winner !== null && league.winner !== user.email) {
                    if (league.league_configuration.format === "Head to Head") {
                        points = league.head_to_head_points.sort((a, b) => b.points - a.points);
                        my_team = head_to_head_points.find(item => item.team.user_email === user.email);
                        if (points[0].points >= (my_team.points + 12)) {
                            ach_count++;
                        }
                    } else {
                        points = league.classic_points.sort((a, b) => b.points_total - a.points_total);
                        my_team = classic_points.find(item => item.team.user_email === user.email);
                        if (points[0].points_total >= (my_team.points_total + 12)) {
                            ach_count++;
                        }
                    }
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE SPINELESS - Processed Successfully.",
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
router.get('/the_snake', async (req, res) => {
    try {
        let win_number = 10;
        let last_gameweek = null;
        let gameweeks = await GameWeek.find({}).sort({ starting_at: 1 });
        const currentGameweekIndex = gameweeks.findIndex(gw => gw.is_current === true);
        if (currentGameweekIndex !== -1) {
            last_gameweek = gameweeks[currentGameweekIndex - 1];
        }
        // Parameter to set number of wins required
        let ach = await FantasyAchievement.findOne({ name: "THE SNAKE" });
        // Fetch all users and parse one by one
        let users = await User.find({}).populate("achievements.achievement");
        for (const user of users) {
            console.log("Processing user: " + user.email);
            let ach_count = 0;
            let teams = await FantasyTeam.find({ user_email: user.email, is_deleted: false }).populate("players.player")
            for (const team of teams) {
                let points_array = [];
                let position = [];
                // "Goalkeeper", "Defender", "Midfielder", "Attacker"
                for (const player of team.players) {
                    if (player.in_team) {
                        let player_points = player.player.points.find(item => item.gameweek.equals(last_gameweek._id))
                        if (position.includes(player.player.position_name)) {
                            let index = points_array.findIndex(item => item.position_name === player.player.position_name)
                            let prev_max = points_array[index].points;
                            if (player_points > prev_max) {
                                points_array[index].points = player_points;
                            }
                        } else {
                            position.push(player.player.position_name);
                            points_array.push({
                                points: player_points,
                                position_name: player.player.position_name
                            })
                        }
                    }
                    let win = true;
                    for (const item of points_array) {
                        if (item.points <= win_number) {
                            win = false;
                        }
                    }
                    if (win) ach_count++;
                }
            }
            // When all leagues of user are processed. Check if ach_count > 0, update user's achievements
            if (ach_count > 0) {
                let ach_found = false
                for (const ach_obj of user.achievements) {
                    if (ach_obj.achievement.name === ach.name) {
                        ach_found = true;
                        ach_obj.unlocked = true;
                        ach_obj.count = ach_obj.count + ach_count;
                    }
                }
                if (!ach_found) {
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
            message: "THE SNAKE - Processed Successfully.",
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