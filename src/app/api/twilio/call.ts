export const recieveCall = async () => {
  const res = await fetch("/api/incoming-call", {
    method: "POST",
  });

  const data = await res.text();
  console.log("TwiML response:", data);
};
