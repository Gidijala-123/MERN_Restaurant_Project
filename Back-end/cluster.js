import cluster from "cluster";
import os from "os";
import "./server.js";

if (cluster.isPrimary) {
  const cpus = os.cpus().length;
  for (let i = 0; i < cpus; i++) cluster.fork();
  cluster.on("exit", () => cluster.fork());
}
