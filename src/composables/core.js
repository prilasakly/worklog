const GAS_URL = import.meta.env.VITE_GAS_URL;
export async function get(action) {
	try {
		const res = await fetch(`${GAS_URL}?action=${action}`, {
			method: "GET",
		});

		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}

		const data = await res.json();

		if (data.error) {
			throw new Error(data.error);
		}

		return data;
	} catch (err) {
		console.error(`GET ${action} error:`, err);
		throw err;
	}
}

export async function post(payload) {
	try {
		const res = await fetch(GAS_URL, {
			method: "POST",
			headers: {
				"Content-Type": "text/plain;charset=utf-8",
			},
			body: JSON.stringify(payload),
		});

		const data = await res.json();

		if (data.error) {
			throw new Error(data.error);
		}

		return data;
	} catch (err) {
		console.error("POST error:", err);
		throw err;
	}
}
