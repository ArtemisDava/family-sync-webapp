export interface MenuEvent {
  name: string;
}

export function handleMenu(menuEvent: MenuEvent): void {
  const list: HTMLUListElement | null = document.querySelector("ul");
  if (!list) return;

  if (menuEvent.name === "menu") {
    menuEvent.name = "close";
    list.classList.add("top-[80px]");
    list.classList.add("opacity-100");
  } else {
    menuEvent.name = "menu";
    list.classList.remove("top-[80px]");
    list.classList.remove("opacity-100");
  }
}
