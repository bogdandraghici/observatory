declare module 'shepherd.js' {
  interface StepOptions {
    id?: string
    text?: string
    attachTo?: { element?: string; on?: string }
    buttons?: Array<{ text?: string; action?: () => void; classes?: string }>
    classes?: string
    scrollTo?: boolean
  }

  interface TourOptions {
    useModalOverlay?: boolean
    defaultStepOptions?: StepOptions
  }

  class Tour {
    constructor(options?: TourOptions)
    addStep(options: StepOptions): void
    start(): void
    next(): void
    back(): void
    complete(): void
    cancel(): void
  }

  const Shepherd: {
    Tour: typeof Tour
  }

  export default Shepherd
}
