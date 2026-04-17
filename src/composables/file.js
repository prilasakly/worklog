export function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const base64 = reader.result.split(",")[1];
			resolve(base64);
		};
		reader.onerror = (error) => reject(error);
		reader.readAsDataURL(file);
	});
}

export function buildFileName(namaKegiatan, tanggal, originalFile) {
	const ext = originalFile.name.split(".").pop();

	const safeName = (namaKegiatan || "foto")
		.replace(/[^a-zA-Z0-9]/g, "_")
		.slice(0, 40);

	const safeDate = (tanggal || new Date().toISOString().split("T")[0]).replace(
		/-/g,
		"",
	);

	return `${safeDate}_${safeName}.${ext}`;
}
