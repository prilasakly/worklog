import { get, post } from "./core";

export function useSatuanApi() {
	const getSatuan = () => get("getSatuan");

	const createSatuan = (namaSatuan) =>
		post({
			action: "createSatuan",
			data: { nama: namaSatuan },
		});

	return {
		getSatuan,
		createSatuan,
	};
}
