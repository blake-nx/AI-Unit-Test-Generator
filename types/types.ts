export type OpenAIModel = "gpt-3.5-turbo-16k" | "gpt-4";

export interface GenerateBody {
  inputLanguage: string;
  inputCode: string;
  model: OpenAIModel;
}
