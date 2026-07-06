import NavItem from "./NavItem";

const navigation = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Products",
    href: "/admin/products",
  },
  {
    title: "Orders",
    href: "/admin/orders",
  },
  {
    title: "Categories",
    href: "/admin/categories",
  },
  {
    title: "Settings",
    href: "/admin/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="logo">
          <div className="logo-icon">VA</div>

          <div className="logo-text">
            <h2>Vidhi</h2>
            <p>Aesthetics</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavItem key={item.href} title={item.title} href={item.href} />
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button>Collapse</button>
      </div>
    </aside>
  );
}
