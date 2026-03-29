interface ModelCost {
  models: string[]
  inputCost: number
  outputCost: number
}

// Costs are in USD per 1000 tokens
const MODEL_COSTS: ModelCost[] = [
  {
    models: ["ft:gpt-3.5-turbo"],
    inputCost: 0.003,
    outputCost: 0.006,
  },
  {
    // Older deprecated model
    models: ["gpt-3.5-turbo-0613", "gpt-3.5-turbo-0301"],
    inputCost: 0.0015,
    outputCost: 0.002,
  },
  {
    models: ["gpt-3.5-turbo-instruct"],
    inputCost: 0.0015,
    outputCost: 0.002,
  },
  {
    models: ["gpt-3.5-turbo-16k"],
    inputCost: 0.003,
    outputCost: 0.004,
  },
  {
    models: ["gpt-3.5-turbo", "gpt-3.5-turbo-1106"],
    inputCost: 0.001,
    outputCost: 0.002,
  },
  {
    models: ["text-davinci-003"],
    inputCost: 0.002,
    outputCost: 0.002,
  },
  {
    models: ["gpt-4-1106", "gpt-4-vision"],
    inputCost: 0.01,
    outputCost: 0.03,
  },
  {
    models: ["gpt-4", "gpt-4-0613", "gpt-4-0314"],
    inputCost: 0.03,
    outputCost: 0.06,
  },
  {
    models: ["gpt-4-32k"],
    inputCost: 0.06,
    outputCost: 0.12,
  },
  {
    models: ["claude-instant-1", "claude-instant-v1"],
    inputCost: 0.00163,
    outputCost: 0.00551,
  },
  {
    models: ["claude-2", "claude-v2", "claude-1", "claude-v1"],
    inputCost: 0.01102,
    outputCost: 0.03268,
  },
  {
    models: ["text-bison", "chat-bison", "code-bison", "codechat-bison"],
    inputCost: 0.0005,
    outputCost: 0.0005,
  },
  {
    models: ["command-nightly", "command"],
    inputCost: 0.015,
    outputCost: 0.015,
  },
  {
    models: ["whisper"],
    inputCost: 0.1, // $ per 1000 seconds
    outputCost: 0,
  },
  {
    models: ["tts-1-hd"],
    inputCost: 0.03,
    outputCost: 0,
  },
  {
    models: ["tts-1"],
    inputCost: 0.015,
    outputCost: 0,
  },
]

export const calcRunCost = (run: any): any => {
  const duration = +new Date(run.ended_at) - +new Date(run.created_at)
  if (duration < 0.01 * 1000) {return 0}
  if (run.type !== "llm" || !run.name) {return 0}

  const modelCost = MODEL_COSTS.find((c) =>
    c.models.find(
      (m) =>
        // Azure models have a different naming scheme
        run.name?.replaceAll("gpt-35", "gpt-3.5").includes(m),
    ),
  )

  if (!modelCost) {return 0}

  const promptTokens = run.prompt_tokens || run.promptTokens || 0
  const completionTokens = run.completion_tokens || run.completionTokens || 0

  const inputCost = (modelCost.inputCost * promptTokens) / 1000
  const outputCost = (modelCost.outputCost * completionTokens) / 1000
  return inputCost + outputCost
}

export const extendWithCosts = (data: any[]): any[] =>
  data?.map((r) => ({
    ...r,
    tokens: r.completion_tokens + r.prompt_tokens,
    runs: r.success + r.errors,
    cost: r.cost || 0,
  }))

export const calculateTotal = (data: any[], key: any): any => data.reduce((acc, item) => acc + (item[key] || 0), 0)
export const calculateAverage = (data: any[], key: string): number => {
  const sum = data.reduce((acc, item) => acc + (item[key] || 0), 0)
  const average = sum / data.length
  return Math.round(average)
}

export const calculateTrend = (data: any[], key: string): number => {
  const n = data.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += data[i][key]
    sumXY += i * data[i][key]
    sumXX += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  return Math.round(slope)
}

export const calculateQuartiles = (arr: any[], key: string): { lq: number; median: number; uq: number } => {
  if (!arr || arr.length === 0) {
      return { lq: 0, median: 0, uq: 0 }
  }

  // Sort the array in ascending order by the key
  const sortedArr = arr.slice().sort((a, b) => (a[key] || 0) - (b[key] || 0))

  // Helper function to calculate the median
  function getMedian(items: any[], k: string): number {
      if (items.length === 0) {return 0}
      const mid = Math.floor(items.length / 2)
      if (items.length % 2 === 0) {
          return ((items[mid - 1]?.[k] || 0) + (items[mid]?.[k] || 0)) / 2
      } else {
          return items[mid]?.[k] || 0
      }
  }

  const median = getMedian(sortedArr, key)

  // Split the array into two halves
  const lowerHalf = sortedArr.slice(0, Math.floor(sortedArr.length / 2))
  const upperHalf = sortedArr.slice(Math.ceil(sortedArr.length / 2))

  // Calculate the lower quartile (LQ) and upper quartile (UQ)
  const lq = getMedian(lowerHalf, key)
  const uq = getMedian(upperHalf, key)

  return { lq, median, uq }
}
