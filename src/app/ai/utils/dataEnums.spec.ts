import { defaultAgents, defaultEvaluators, defaultExpTypes, defaultLLMProviders } from './dataEnums'

describe('dataEnums', () => {

  describe('defaultAgents', () => {
    it('should have at least 5 agents', () => {
      expect(defaultAgents.length).toBeGreaterThanOrEqual(5)
    })

    it('should have name and code for each agent', () => {
      for (const agent of defaultAgents) {
        expect(agent.name).toBeTruthy()
        expect(agent.code).toBeTruthy()
      }
    })

    it('should include Assistant', () => {
      expect(defaultAgents.find(a => a.code === 'Assistant')).toBeTruthy()
    })
  })

  describe('defaultEvaluators', () => {
    it('should have unique codes', () => {
      const codes = defaultEvaluators.map(e => e.code)
      expect(new Set(codes).size).toBe(codes.length)
    })

    it('should have required fields', () => {
      for (const ev of defaultEvaluators) {
        expect(ev.name).toBeTruthy()
        expect(ev.code).toBeTruthy()
        expect(ev.category).toBeTruthy()
        expect(ev.library).toBeTruthy()
        expect(ev.tags).toBeDefined()
        expect(typeof ev.requiresLlm).toBe('boolean')
        expect(typeof ev.requiresReference).toBe('boolean')
      }
    })

    it('should contain llm_judge evaluators', () => {
      const llmJudge = defaultEvaluators.filter(e => e.category === 'llm_judge')
      expect(llmJudge.length).toBeGreaterThan(0)
    })

    it('should contain deterministic evaluators', () => {
      const det = defaultEvaluators.filter(e => e.category === 'deterministic')
      expect(det.length).toBeGreaterThan(0)
    })

    it('should contain trajectory evaluators', () => {
      const traj = defaultEvaluators.filter(e => e.category === 'trajectory')
      expect(traj.length).toBeGreaterThan(0)
    })

    it('should have correctness evaluator requiring reference', () => {
      const correctness = defaultEvaluators.find(e => e.code === 'correctness')
      expect(correctness).toBeTruthy()
      expect(correctness!.requiresReference).toBe(true)
      expect(correctness!.requiresLlm).toBe(true)
    })

    it('should have exact_match not requiring LLM', () => {
      const exactMatch = defaultEvaluators.find(e => e.code === 'exact_match')
      expect(exactMatch).toBeTruthy()
      expect(exactMatch!.requiresLlm).toBe(false)
    })
  })

  describe('defaultExpTypes', () => {
    it('should have 3 types', () => {
      expect(defaultExpTypes.length).toBe(3)
    })

    it('should have Dataset, AgentTrajectory, Custom', () => {
      const codes = defaultExpTypes.map(t => t.code)
      expect(codes).toContain('Dataset')
      expect(codes).toContain('AgentTrajectory')
      expect(codes).toContain('Custom')
    })

    it('Dataset type should exclude trajectory evaluators', () => {
      const dataset = defaultExpTypes.find(t => t.code === 'Dataset')!
      const hasTrajectory = dataset.evaluators.some((e: any) => e.category === 'trajectory')
      expect(hasTrajectory).toBe(false)
    })

    it('AgentTrajectory type should only have trajectory evaluators', () => {
      const traj = defaultExpTypes.find(t => t.code === 'AgentTrajectory')!
      const allTrajectory = traj.evaluators.every((e: any) => e.category === 'trajectory')
      expect(allTrajectory).toBe(true)
    })

    it('Custom type should have all evaluators', () => {
      const custom = defaultExpTypes.find(t => t.code === 'Custom')!
      expect(custom.evaluators.length).toBe(defaultEvaluators.length)
    })
  })

  describe('defaultLLMProviders', () => {
    it('should have known providers', () => {
      const codes = defaultLLMProviders.map(p => p.code)
      expect(codes).toContain('OpenAI')
      expect(codes).toContain('Anthropic')
      expect(codes).toContain('Google')
      expect(codes).toContain('Ollama')
    })

    it('should have models for OpenAI', () => {
      const openai = defaultLLMProviders.find(p => p.code === 'OpenAI')!
      expect(openai.models.length).toBeGreaterThan(0)
      expect(openai.models.find((m: any) => m.model === 'gpt-4o')).toBeTruthy()
    })

    it('should have empty models for Ollama (loaded dynamically)', () => {
      const ollama = defaultLLMProviders.find(p => p.code === 'Ollama')!
      expect(ollama.models.length).toBe(0)
    })

    it('each provider should have name and code', () => {
      for (const provider of defaultLLMProviders) {
        expect(provider.name).toBeTruthy()
        expect(provider.code).toBeTruthy()
        expect(Array.isArray(provider.models)).toBe(true)
      }
    })
  })
})
