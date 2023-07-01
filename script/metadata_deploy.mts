import { CIDString, NFTStorage } from "nft.storage";
import { filesFromPath } from "files-from-path";
import path from 'path';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEExODc4QzhEZjliN2RCNzE0MGU4MWQzQ2FjYTBhMkFCMjM0N0Y2QzkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2Njc3MjkxMjQ3MywibmFtZSI6IkVBUlRIIn0.EYYdPyXhiYLf6Lspc0hJJFfOiW8P5ERKJMFeIwpzx9k';

async function deployDirectory(directoryPath: string): Promise<CIDString> {
  const files = filesFromPath(directoryPath, {
    pathPrefix: path.resolve(directoryPath),
    hidden: true,
  });

  const storage = new NFTStorage({ token });

  console.log(`storing file(s) from ${directoryPath}`);
  const cid = await storage.storeDirectory(files);
  console.log({ cid });

  const status = await storage.status(cid);
  console.log(status);

  return cid;
}

const metaDataPath = "../tmp/metadata/json/";
deployDirectory(metaDataPath);
