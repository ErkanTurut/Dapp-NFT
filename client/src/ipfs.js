import { create } from "ipfs-http-client";
const ipfs = new create({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});
export default ipfs;
