"use client"
import { ReactNode } from "react";
import Sidebar from "./sideBar";

type MenuType = {
    id: string;
    icon: ReactNode;
    path: string;
    label: string;
    category: "dashboard" | "communication" | "settings";
};

type Props = {
    children: ReactNode;
    id: string;
    title: string;
    menuList: MenuType[];
};

const SidebarTemplate = ({ children, id, title, menuList }: Props) => (
    <Sidebar menuList={menuList} title={title} id={id}>
        {children}
    </Sidebar>
);

export default SidebarTemplate;