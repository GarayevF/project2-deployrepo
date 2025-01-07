import {Link} from 'react-router-dom'
import '../styles/Navbar.css'
function Navbar(){
    return (
        <nav className="navbar">
          <div className="container">
            <h1 className="logo">Recipe App</h1>
            <ul className="nav-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/recipes">Recipes</Link>
              </li>
              <li>
                <Link to="/contact">Contact Me</Link>
              </li>
            </ul>
          </div>
        </nav>
      );
}

export default Navbar