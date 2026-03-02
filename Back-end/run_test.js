import { spawn } from "child_process";
const p = spawn("node", ["server.js"]);
p.stdout.on("data", d => console.log("STDOUT:", d.toString()));
p.stderr.on("data", d => console.log("STDERR:", d.toString()));
p.on("close", c => console.log("EXIT:", c));
