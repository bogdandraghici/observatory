import moment from 'moment'

export const getDuration = (llmCall: any): string => parseFloat(
    moment(llmCall.ended_at)
      .diff(moment(llmCall.created_at), 'seconds', true)
      .toString(),
  ).toFixed(2)

export const getDurationLLM = (llmCall: any): string => parseFloat(
    moment(llmCall.ended)
      .diff(moment(llmCall.time), 'seconds', true)
      .toString(),
  ).toFixed(2)

export const formatTime = (llmCall: any): string => moment.utc(llmCall).local(false).format('DD MMM, HH:mm:ss')

export const processDuration = (duration: any): number =>
  Math.round(moment.duration(duration).asSeconds() * 100) / 100
