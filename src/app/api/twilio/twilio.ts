const sendCode = async (verificationCode: string, providedPhone: string) => {
  const res = await fetch("/api/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: verificationCode, providedPhone }),
  });

  const data = await res.json();

  if (data.result && data.result.length > 0) {
    const instructions = data.result[0].text;

    return instructions;
  }
};

export default sendCode;
