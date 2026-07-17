import { useSpring, animated } from "@react-spring/web";
import { NavLink } from "react-router";

export function Homepage() {
  const [springs, api] = useSpring(() => ({

    from: { opacity: 0, x:5000 },
    to: {opacity: 1, x: 0}
  }));

  const handleClick = () => {
    api.start({
      from: { opacity:0 },
      to: {opacity:1}
    })
  }

  return (
    <animated.div onClick={handleClick} style={{ ...springs }} >
      <div className="text-center space-y-4">
        <h1 className="text-7xl font-semibold p4">Welcome to Exercise Generator</h1>
        <p className="text-xl p4">No bells and whistles. Just good old-fashioned workouts to help you stay healthy.</p>
        <NavLink to="/buildWorkout">
          <button type="button" className="text-white bg-linear-to-r from-cyan-500 to-blue-500 hover:bg-linear-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-full text-sm px-4 py-2.5 text-center leading-5 p4">Get Started</button>
        </NavLink>
      </div>
    </animated.div>
  );
}
