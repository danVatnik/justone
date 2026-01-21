import './Header.css';

function Header({ showLeaveButton, onLeaveLobby }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-title">Just</div>
        <span className="version-number">v1.0</span>
      </div>
      {showLeaveButton && (
        <button className="leave-button header-leave" onClick={onLeaveLobby}>
          Leave Game
        </button>
      )}
    </header>
  );
}

export default Header;
