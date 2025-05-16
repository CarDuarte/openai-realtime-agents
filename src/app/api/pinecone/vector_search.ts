const runVectorSearch = async (userQuery: string) => {
  const res = await fetch("/api/vector-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: userQuery }),
  });

  const data = await res.json();

  if (data.result && data.result.length > 0) {
    const instructions = data.result[0].text;

    return instructions;
  }
};

export default runVectorSearch;
