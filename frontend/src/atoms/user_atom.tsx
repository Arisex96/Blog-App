import {atom,atomFamily,selector,selectorFamily} from "recoil";


const user_atom = atom({
    key : "user_atom",
    default : ""
})

export default user_atom;