import coinHead from "../assets/coin-head.svg";
import coinTail from "../assets/coin-tail.svg";
import "./CoinGroup.css";

export default function CoinGroup({ coins, isFlipping }) {
  return (
    <div className="coin-group">
      {coins.map((isHead, i) => (
        <img
          key={i}
          src={isHead ? coinHead : coinTail}
          className={`coin ${isFlipping ? "flipping" : ""}`}
          style={{ animationDelay: `${i * 0.1}s` }}
          alt={isHead ? "正面" : "反面"}
        />
      ))}
    </div>
  );
}
