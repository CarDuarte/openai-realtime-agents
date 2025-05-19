const recieveCall = async () => {
  const res = await fetch("/api/incoming-call", {
    method: "POST",
  });

  const data = await res.json();
  console.log("data", data);
};

export default recieveCall;
