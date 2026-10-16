
function handler(event) {
    const passenger = event.passenger || {};

    if (!passenger.name || !passenger.flightNumber) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Passenger name and flight number are required"
            })
        };
    }

    const boardingPass = {
        passengerName: passenger.name,
        flightNumber: passenger.flightNumber,
        seat: passenger.seat || "Not assigned",
        status: "Checked In",
        generatedAt: new Date().toISOString()
    };

    return {
        statusCode: 200,
        body: JSON.stringify(boardingPass, null, 2)
    };
}

module.exports = { handler };
