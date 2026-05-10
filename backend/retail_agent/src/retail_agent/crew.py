from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

@CrewBase
class RetailAgent():
    """RetailAgent crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    @agent
    def customer_behavior_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['customer_behavior_agent'],
            llm='groq/llama-3.3-70b-versatile',
            verbose=True
        )

    @agent
    def offer_recommendation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['offer_recommendation_agent'],
            llm='groq/llama-3.3-70b-versatile',
            verbose=True
        )

    @agent
    def pos_integration_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['pos_integration_agent'],
            llm='groq/llama-3.3-70b-versatile',
            verbose=True
        )

    @task
    def customer_behavior_task(self) -> Task:
        return Task(
            config=self.tasks_config['customer_behavior_task'],
        )

    @task
    def offer_recommendation_task(self) -> Task:
        return Task(
            config=self.tasks_config['offer_recommendation_task'],
        )

    @task
    def pos_integration_task(self) -> Task:
        return Task(
            config=self.tasks_config['pos_integration_task'],
        )

    @crew
    def crew(self) -> Crew:
        """Creates the RetailAgent crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
