import { useEffect, useState } from "react";
import { Link } from "react-router";

import { CheckIcon } from "../../components/Icons";

interface Example {
  label: string;
  question: string;
  tools: string[];
  intro: string;
  numbered: boolean;
  items: [title: string, author: string, note: string][];
  outro: string;
}

/** Real answers from the books at homelibraries.org/beto. */
const EXAMPLES: Example[] = [
  {
    label: "Hidden gems",
    question: "What are the best books in this library that I’m unlikely to have heard of?",
    tools: ['search_books(status: "read", sort: "title")'],
    intro: "Four five-star reads that rarely make anyone’s list:",
    numbered: false,
    items: [
      ["Fenomenul Pitești", "Virgil Ierunca", "The Romanian prison where inmates were forced to “re-educate” each other through torture. Short and unforgettable."],
      ["Island of the Lost", "Joan Druett", "Two crews wrecked on the same subantarctic island in 1864. One holds together, the other falls apart."],
      ["Corações Sujos", "Fernando Morais", "The secret society of Japanese immigrants in Brazil who refused to believe Japan had lost the war."],
      ["Christian Slaves, Muslim Masters", "Robert C. Davis", "The forgotten history of Europeans enslaved on the Barbary Coast."],
    ],
    outro: "Want me to pick one based on what you’ve read lately?",
  },
  {
    label: "Big ideas",
    question: "What are the most interesting ideas represented across this library?",
    tools: ["library_stats()", 'search_books(status: "read")'],
    intro: "A few ideas keep coming back across these shelves:",
    numbered: false,
    items: [
      ["Two visions of human nature", "A Conflict of Visions", "Most political arguments trace back to whether you think people are perfectible or permanently constrained."],
      ["Knowledge is scattered", "Knowledge and Decisions · The Road to Serfdom", "No planner can know what millions of people know. Prices and traditions carry that knowledge."],
      ["Ordinary people, extraordinary evil", "Eichmann in Jerusalem · Ordinary Men", "The worst crimes are rarely done by monsters, mostly by unremarkable people going along."],
      ["Meaning under pressure", "Man’s Search for Meaning · Antifragile", "Hardship can break people or make them stronger, and having a reason to endure decides which."],
    ],
    outro: "Pick one and I’ll build you a reading path.",
  },
  {
    label: "A reading path",
    question: "Pick one interesting idea from this library and give me a path of 5 books to explore it deeply.",
    tools: ['search_books(q: "evil")', 'search_books(status: "read", sort: "date_read")'],
    intro: "Idea: how ordinary people come to do terrible things. Read them in this order:",
    numbered: true,
    items: [
      ["Eichmann in Jerusalem", "Hannah Arendt", "Start with the idea itself: the banality of evil."],
      ["Ordinary Men", "Christopher R. Browning", "Watch it happen: middle-aged reserve policemen become killers in occupied Poland."],
      ["Uma Temporada de Facões", "Jean Hatzfeld", "Rwanda, told in the perpetrators’ own words."],
      ["Fenomenul Pitești", "Virgil Ierunca", "How a system turns its victims into torturers."],
      ["The Gulag Archipelago", "Aleksandr Solzhenitsyn", "The conclusion: the line between good and evil runs through every human heart."],
    ],
    outro: "All five are already on this shelf, and every one is rated five stars.",
  },
];

const TICK_MS = 40;
const TOOL_TICKS = 30;
const ITEM_TICKS = 16;
const OUTRO_TICKS = 20;
const HOLD_TICKS = 170;
const ACCENTS = ["var(--cloth-1)", "var(--cloth-2)", "var(--cloth-3)", "var(--cloth-4)"];

/** Tick marks of one example: typing, calling tools, answering, then holding. */
function timeline(e: Example) {
  const typed = Math.ceil(e.question.length / 2);
  const tools = typed + TOOL_TICKS;
  const outro = tools + e.items.length * ITEM_TICKS + OUTRO_TICKS;
  return { typed, tools, outro, end: outro + HOLD_TICKS };
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** An assistant answering questions from a library, replayed in a loop. */
export function Demo() {
  // With reduced motion every example shows complete and nothing moves.
  const [still] = useState(reducedMotion);
  const [{ ex, tick }, setPlay] = useState({ ex: 0, tick: 0 });

  useEffect(() => {
    if (still) return;
    const timer = setInterval(
      () =>
        setPlay(({ ex, tick }) =>
          tick + 1 >= timeline(EXAMPLES[ex]!).end ? { ex: (ex + 1) % EXAMPLES.length, tick: 0 } : { ex, tick: tick + 1 },
        ),
      TICK_MS,
    );
    return () => clearInterval(timer);
  }, [still]);

  const pick = (i: number) => setPlay({ ex: i, tick: 0 });
  const e = EXAMPLES[ex]!;
  const t = timeline(e);
  const at = still ? t.end : tick;

  const typing = at < t.typed;
  const toolsDone = at >= t.tools;
  const shown = toolsDone ? Math.min(e.items.length, Math.floor((at - t.tools) / ITEM_TICKS) + 1) : 0;
  const progress = Math.min(1, at / t.end);

  return (
    <div className="demo-frame">
      <div className="demo">
        <div className="demo-bar">
          <span className="demo-bar-left">
            <span className="demo-lights" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <strong>Claude</strong>
          </span>
          <span className="pill pill-mono">
            <span className="dot" aria-hidden="true" />
            homelibraries.org/beto/mcp
          </span>
        </div>

        <div className="demo-body">
          <div className="demo-tabs" role="tablist" aria-label="Example questions">
            <span className="demo-tabs-label">Try asking</span>
            {EXAMPLES.map((x, i) => (
              <button
                key={x.label}
                type="button"
                role="tab"
                aria-selected={i === ex}
                aria-controls="demo-chat"
                onClick={() => pick(i)}
              >
                <span className="demo-tab-head">
                  <strong>{x.label}</strong>
                  <span className="mono">0{i + 1}</span>
                </span>
                <span className="demo-tab-question">{x.question}</span>
                <span className="demo-progress" aria-hidden="true">
                  <span style={{ width: i === ex ? `${Math.round(progress * 100)}%` : 0 }} />
                </span>
              </button>
            ))}
          </div>

          <div id="demo-chat" className="demo-chat" role="tabpanel" aria-label={e.label}>
            <div className="bubble">
              {typing ? e.question.slice(0, at * 2) : e.question}
              {typing && <span className="caret" aria-hidden="true" />}
            </div>

            {!typing && (
              <div className="tool-calls">
                {e.tools.map((call) => (
                  <span key={call} className="tool-call">
                    {toolsDone ? (
                      <span className="tool-ok">
                        <CheckIcon size={10} />
                      </span>
                    ) : (
                      <span className="spinner spinner-sm" />
                    )}
                    {call}
                  </span>
                ))}
              </div>
            )}

            {toolsDone && (
              <div className="answer">
                <span className="answer-mark" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <div className="answer-body">
                  <p className="fade-up">{e.intro}</p>
                  <ol>
                    {e.items.slice(0, shown).map(([title, author, note], i) => (
                      <li key={title} className="fade-up">
                        {e.numbered ? (
                          <span className="answer-n mono">{i + 1}</span>
                        ) : (
                          <span className="answer-rule" style={{ background: ACCENTS[i % ACCENTS.length] }} />
                        )}
                        <span>
                          <span>
                            <strong>{title}</strong> <span className="muted">· {author}</span>
                          </span>
                          <span className="answer-note">{note}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  {shown < e.items.length && (
                    <span className="thinking" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                  {at >= t.outro && <p className="muted fade-up">{e.outro}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="demo-caption">
        Example conversations, answered from the books at <Link to="/beto">homelibraries.org/beto</Link>.
      </p>
    </div>
  );
}
