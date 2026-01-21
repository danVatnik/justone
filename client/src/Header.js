import './Header.css';

function Header({ showLeaveButton, onLeaveLobby, isAdmin }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-title">Just</div>
        <span className="version-number">v1.2.1</span>
        {isAdmin && <span className="admin-badge">Admin</span>}
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
