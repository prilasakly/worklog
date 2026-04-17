import { useLogbookApi } from "./logbook";
import { useSatuanApi } from "./satuan";
import { useTaskApi } from "./task";

export function useApi() {
	return {
		...useLogbookApi(),
		...useSatuanApi(),
		...useTaskApi(),
	};
}
