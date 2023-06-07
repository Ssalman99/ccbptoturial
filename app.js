const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//conver dbobject t Response object

const convertDbobjectToResponseobjct = (DBobject) => {
  return {
    playerId: DBobject.player_id,
    playerName: DBobject.player_name,
  };
};

// 1  ..  get players list

app.get("/players/", async (request, response) => {
  try {
    const playerQuery = `
        SELECT *
        FROM player_details
        ORDER BY  
            player_id;`;
    const playerArray = await db.all(playerQuery);
    response.send(
      playerArray.map((each) => convertDbobjectToResponseobjct(each))
    );
  } catch (e) {
    console.log(`GET players Error: ${e.message}`);
  }
});

//2...get player Dretails use with player ID

app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerQuery = `
        SELECT *
        FROM player_details
        WHERE 
            player_id=${playerId};`;
    const playerArray = await db.all(playerQuery);
    response.send(
      ...playerArray.map((each) => convertDbobjectToResponseobjct(each))
    );
  } catch (e) {
    console.log(`GET players Error: ${e.message}`);
  }
});

//3..  update players
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const playerQuery = `
        UPDATE 
            player_details
        SET 
            player_name='${playerName}'
        WHERE 
            player_id=${playerId};`;
  await db.run(playerQuery);
  response.send("Player Details Updated");
});
//covert response object match details
const convertToResponseObject = (dbobject) => {
  return {
    matchId: dbobject.match_id,
    match: dbobject.match,
    year: dbobject.year,
  };
};

//4..get match details use with match ID

app.get("/matches/:matchId/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const playerQuery = `
        SELECT *
        FROM match_details
        WHERE 
            match_id=${matchId};`;
    const playerArray = await db.get(playerQuery);
    response.send(convertToResponseObject(playerArray));
  } catch (e) {
    console.log(`GET players Error: ${e.message}`);
  }
});

//5....get players details use of playerId

app.get("/players/:playerId/matches", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerQuery = `
        SELECT *
        FROM player_match_score 
            NATURAL JOIN match_details
        WHERE 
            player_id=${playerId};`;
    const playerArray = await db.all(playerQuery);
    response.send(playerArray.map((each) => convertToResponseObject(each)));
  } catch (e) {
    console.log(`GET players Error: ${e.message}`);
  }
});

//6... get players of specific match use of match ID

app.get("/matches/:matchId/players", async (request, response) => {
  try {
    const { matchId } = request.params;
    const playerQuery = `
        SELECT *
        FROM player_match_score 
            NATURAL JOIN player_details
        WHERE 
            match_id=${matchId};`;
    const playerArray = await db.all(playerQuery);
    response.send(
      playerArray.map((each) => convertDbobjectToResponseobjct(each))
    );
  } catch (e) {
    console.log(`GET players Error: ${e.message}`);
  }
});

//7... get total score of player use in player ID
app.get("/players/:playerId/playerScores", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerQuery = `
         SELECT
            player_details.player_id AS playerId,
            player_details.player_name AS playerName,
            SUM(player_match_score.score) AS totalScore,
            SUM(fours) AS totalFours,
            SUM(sixes) AS totalSixes FROM 
            player_details INNER JOIN player_match_score ON
            player_details.player_id = player_match_score.player_id
            WHERE player_details.player_id = ${playerId};
            `;

    const playerArray = await db.all(playerQuery);
    response.send(...playerArray);
  } catch (e) {
    console.log(`GET players Error: ${e.message}`);
  }
});

module.exports = app;
