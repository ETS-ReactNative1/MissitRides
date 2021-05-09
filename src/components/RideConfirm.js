export async function submitReq() {
    console.log("Confirm Ride")
    let userid = 1;
    var req_string = "https://missit-ridesapi-backend.ue.r.appspot.com/confirm?bitstring=" + userid;
    await fetch(req_string, {
  
      method: "POST",
  
      body: null
    })
  }