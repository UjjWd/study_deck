import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FancyLogoutButton from "@/components/FancyLogoutButton";
import { useNavigate } from "react-router-dom";
const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/notes", label: "Notes" },
  { path: "/revision-queue", label: "Revision Queue" },
  
];

const Navbar = () => {
  const location = useLocation();
  // Placeholder: not logged in if at /login or /signup
  const isAuth = !(location.pathname === "/login" || location.pathname === "/signup");
  return (
    <nav className="w-full border-b p-4 bg-background flex items-center justify-between">
      <div className="flex flex-col">
        <Link to="/" className="text-2xl font-bold text-primary">🧠 StudyDeck</Link>
        <span className="text-xs text-muted-foreground">created by Sparsh.io</span>
      </div>
      <div className="flex gap-2">
        {isAuth ? (
          <>
            {navItems.map(({ path, label }) => (
              <Button
                key={path}
                asChild
                variant={location.pathname === path ? "secondary" : "ghost"}
                size="sm"
              >
                <Link to={path}>{label}</Link>
              </Button>
            ))}
            <FancyLogoutButton  />;
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;