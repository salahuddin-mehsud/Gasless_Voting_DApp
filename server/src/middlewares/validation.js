export const validatePollCreation = (req, res, next) => {
  const { question, options, durationInMinutes } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Poll question is required'
    });
  }

  if (!options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'At least two options are required'
    });
  }

  for (let i = 0; i < options.length; i++) {
    if (!options[i] || options[i].trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: `Option ${i + 1} cannot be empty`
      });
    }
  }

  if (!durationInMinutes || durationInMinutes < 1) {
    return res.status(400).json({
      success: false,
      message: 'Valid duration is required'
    });
  }

  next();
};

export const validateVote = (req, res, next) => {
  const { optionIndex, signature, nonce } = req.body;

  // Check optionIndex
  if (optionIndex === undefined || optionIndex === null) {
    return res.status(400).json({
      success: false,
      message: 'Option index is required'
    });
  }

  if (optionIndex < 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid option index'
    });
  }

  // 🔥 REQUIRED for on-chain voting
  if (!signature || typeof signature !== 'string' || signature.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid signature is required for on-chain voting'
    });
  }

  // 🔥 REQUIRED for on-chain voting
  if (nonce === undefined || nonce === null) {
    return res.status(400).json({
      success: false,
      message: 'Nonce is required for on-chain voting'
    });
  }

  // Validate nonce format
  const nonceNum = parseInt(nonce);
  if (isNaN(nonceNum) || nonceNum < 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid nonce format'
    });
  }

  next();
};