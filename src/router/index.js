import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import LogbookView from "../views/LogbookView.vue";
import TaskView from "../views/TaskView.vue";

const routes = [
	{ path: "/", redirect: "/dashboard" },
	{ path: "/dashboard", component: Dashboard, name: "dashboard" },
	{ path: "/logbook", component: LogbookView, name: "logbook" },
	{ path: "/task", component: TaskView, name: "task" },
];

export default createRouter({
	history: createWebHashHistory(),
	routes,
});
