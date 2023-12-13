const exe = require("express");
const app = exe();
app.use(exe.json());

let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
const path = require("path");

let db_path = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const instalizeserver = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("started"));
  } catch (e) {
    console.log(e.message);
  }
};
const converttoupper_2 = (each) => {
  return {
    playerId: each.player_id,
    playerName: `${each.player_name}`,
  };
};
const converttoupper = (each) => {
  return {
    playerId: each.player_id,
    playerName: `${each.player_name}`,
  };
};
const convert_upper = (each) => {
  return {
    matchId: each.match_id,
    match: each.match,
    year: each.year,
  };
};
instalizeserver();

// API 1 GET

app.get("/players/", async (request, response) => {
  let query = `
    SELECT 
    *
    FROM 
    player_details;`;
  let result = await db.all(query);
  response.send(result.map((each) => converttoupper(each)));
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let query = `
    SELECT 
    *
    FROM
    player_details
    WHERE 
    player_id=${playerId};`;
  let result = await db.get(query);
  response.send({
    playerId: result["player_id"],
    playerName: result["player_name"],
  });
});

// API 3 PUT
app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  console.log(playerId);
  let { playerName } = request.body;
  console.log(playerName);
  let query = `
  UPDATE
  player_details
  SET 
  player_name='${playerName}'
  WHERE
  player_id=${playerId};`;
  let result = await db.run(query);
  response.send("Player Details Updated");
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  const query = `
  SELECT 
  *
  FROM
  match_details
  WHERE
  match_id=${matchId};`;
  let result = await db.get(query);
  response.send({
    matchId: result["match_id"],
    match: `${result["match"]}`,
    year: result["year"],
  });
});

//API 5 GET

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `
  SELECT 
  match_details.match_id AS match_id,
  match_details.match AS match,
  match_details.year AS year
  FROM 
  match_details natural join player_match_score
  WHERE 
  player_match_score.player_id=${playerId};`;
  const result = await db.all(query);
  response.send(result.map((each) => convert_upper(each)));
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `
  SELECT 
  player_match_score.player_id AS player_id,
  player_details.player_name AS player_name
  FROM
  player_details natural join player_match_score
  WHERE
  player_match_score.match_id=${matchId};`;
  let result = await db.all(query);
  response.send(result.map((each) => converttoupper_2(each)));
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  let { playerId } = request.params;
  let query = `
  SELECT 
  player_details.player_id AS player_id,
  player_details.player_name AS player_name,
  sum(player_match_score.score) AS match_score,
  sum(player_match_score.fours) AS fours,
  sum(player_match_score.sixes) AS sixes
  FROM
  player_details inner join player_match_score on 
  player_details.player_id=player_match_score.player_id
  WHERE 
  player_details.player_id=${playerId};`;
  let result = await db.get(query);
  response.send({
    playerId: result["player_id"],
    playerName: result["player_name"],
    totalScore: result["match_score"],
    totalFours: result["fours"],
    totalSixes: result["sixes"],
  });
});
module.exports = app;
