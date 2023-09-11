const Backgroundjob = require('@models/Backgroundjob')

async function processBackgroundjob(data) {
  const { jobId } = data
  const backgroundjob = await Backgroundjob.findById(jobId).populate('licensee')

  const actions = [
    {
      action: `process-backgroundjob-${backgroundjob.kind}`,
      body: { ...backgroundjob.body, jobId },
    },
  ]

  return actions
}

module.exports = processBackgroundjob
