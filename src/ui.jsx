export function Button({ as = "button", variant = "default", className = "", ...props }) {
  const Component = as;
  return <Component className={`ui-button ${variant} ${className}`} {...props} />;
}

export function Card({ className = "", ...props }) {
  return <div className={`ui-card ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`ui-card-header ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`ui-card-content ${className}`} {...props} />;
}

export function Badge({ className = "", ...props }) {
  return <span className={`ui-badge ${className}`} {...props} />;
}

export function Input(props) {
  return <input className="ui-input" {...props} />;
}

export function Textarea(props) {
  return <textarea className="ui-textarea" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="ui-select" {...props}>
      {children}
    </select>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="ui-tabs" role="tablist" aria-label="Admin content sections">
      {tabs.map((tab) => (
        <button
          className={active === tab.id ? "active" : ""}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
