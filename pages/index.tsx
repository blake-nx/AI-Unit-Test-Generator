import { CodeBlock } from '@/components/CodeBlock';
import { LanguageSelect } from '@/components/LanguageSelect';
import { ModelSelect } from '@/components/ModelSelect';
import { TextBlock } from '@/components/TextBlock';
import { OpenAIModel, GenerateBody } from '@/types/types';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [inputLanguage, setInputLanguage] = useState<string>('JavaScript');
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [model, setModel] = useState<OpenAIModel>('gpt-4');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasGenerated, sethasGenerated] = useState<boolean>(false);

  const handleGenerate = async () => {
    const maxCodeLength = model === 'gpt-3.5-turbo-16k' ? 64000 : 32000;

    if (!inputCode) {
      alert('Please enter some code.');
      return;
    }

    if (inputCode.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputCode.length} characters.`,
      );
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body: GenerateBody = {
      inputLanguage,
      inputCode,
      model,
    };

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    sethasGenerated(true);
    copyToClipboard(code);
  };

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  useEffect(() => {
    if (hasGenerated) {
      handleGenerate();
    }
  }, []);



  return (
    <>
      <Head>
        <title>Unit Test Generator</title>
        <meta
          name="description"
          content="Use AI to generate Unit Tests."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-full min-h-screen flex-col items-center bg-[#0E1117] px-4 pb-20 text-neutral-200 sm:px-10">
        <div className="flex flex-col items-center justify-center mt-10 sm:mt-20">
          <div className="text-4xl font-bold">Unit Test Generator</div>
        </div>
        
        <div className="flex items-center mt-2 space-x-2">
          If your code is too long, you can switch to the GPT-3.5 model which has a limit of 16k tokens.
        </div>
        
        <div className="mt-2 text-xs text-center">
          {loading
            ? 'Doing the thing...'
            : hasGenerated
            ? 'Output copied to clipboard!'
            : 'Enter your code, select your language, and click "Generate"'}

        </div>
        
         <div className="flex items-center mt-2 space-x-2">
          <ModelSelect model={model} onChange={(value) => setModel(value)} />
                                  <button
            className="w-[140px] cursor-pointer rounded-md bg-violet-500 px-4 py-2 font-bold hover:bg-violet-600 active:bg-violet-700"
            onClick={() => handleGenerate()}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <div className="mt-6 flex w-full max-w-[1200px] flex-col justify-between sm:flex-row sm:space-x-4">
          <div className="flex flex-col justify-center space-y-2 h-100 sm:w-2/4">
            <LanguageSelect
              language={inputLanguage}
              onChange={(value) => {
                setInputLanguage(value);
                sethasGenerated(false);
                setInputCode('');
                setOutputCode('');
              }}
            />

            {inputLanguage === 'Natural Language' ? (
              <TextBlock
                text={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  sethasGenerated(false);
                }}
              />
            ) : (
              <CodeBlock
                code={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  sethasGenerated(false);
                }}
              />
            )}
          </div>
          <div className="flex flex-col justify-center h-full mt-8 space-y-2 sm:mt-0 sm:w-2/4">
            <div className="w-full rounded-md bg-[#1F2937] px-4 py-2 text-neutral-200 font-bold text-center">Output</div>
              <CodeBlock code={outputCode} />
          </div>
        </div>

      </div>
    </>
  );
}
