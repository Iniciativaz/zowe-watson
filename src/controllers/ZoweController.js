const zowe = require("@zowe/cli");

const profileSSH = {
  host: process.env.MFHOST,
  user: process.env.MFUSER,
  password: process.env.MFPWD,
  rejectUnauthorized: false,
};

const SSHsession = zowe.SshSession.createBasicSshSession(profileSSH);

const profile = {
  ...profileSSH,
  port: process.env.MFPORT,
};

const zOSMFsession = zowe.ZosmfSession.createBasicZosmfSession(profile);

const issueMVSCommand = async (command) => {
  const { commandResponse } = await zowe.IssueCommand.issueAndCollect(
    zOSMFsession,
    { command },
    {}
  );
  return commandResponse;
};

const readDataset = async (dsname) => {
  const data = await zowe.Get.dataSet(zOSMFsession, dsname);
  return data.toString();
};

const issueUSSCommand = async (command) => {
  const response = [];
  await zowe.Shell.executeSsh(SSHsession, command, (data) => {
    response.push(data);
  });
  return response;
};

module.exports = {
  dispatch: async (req, res) => {
    console.log("Request received");
    const { intention, command, dsname } = req.body;
    var data;
    switch (intention) {
      case "MVS_COMMAND":
        data = await issueMVSCommand(command);
        break;
      case "READ_DATASET":
        data = await readDataset(dsname);
        break;
      case "USS_COMMAND":
        data = await issueUSSCommand(command);
        break;

      default:
        data = `Invalid options: ${req.body}`;
        break;
    }
    return res.json({data});
  },
};
