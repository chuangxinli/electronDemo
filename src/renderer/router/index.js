import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/SignIn',
            name: 'SignIn',
            component: require('@/pages/SignIn').default
        },
        {
            path: '/Home',
            name: 'Home',
            component: require('@/pages/Home').default,
            redirect: '/Home/MonthReport',
            children: [
                {
                    path: '/Home/MonthReport',
                    name: 'MonthReport',
                    component: require('@/pages/MonthReport').default
                },
                {
                    path: '/Home/WeekReport',
                    name: 'WeekReport',
                    component: require('@/pages/WeekReport').default
                }
            ]
        },
        {
            path: '*',
            redirect: '/SignIn'
        }
    ]
})
