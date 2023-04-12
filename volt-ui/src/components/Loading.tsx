export const Loading = (props) => (
    <div style={{
        "min-width": props.width || "92px",
        "width": props.width || "92px",
        "height": props.height || "60px",
        "display": "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center",
        "border": props.button ? "2px solid var(--fg)" : "none",
        "user-select": "none",
        ...(props.style!)
    }}>
        <span style={{
            'border': '6px solid ' + (props.background || 'var(--hl)'),
            'border-top': '6px solid ' + (props.color || 'var(--green)'),
            'border-radius': '50%',
            'height': props.iconSize || '24px',
            'width': props.iconSize || '24px',
            'animation': 'spin 2s linear infinite'
        }} />
        <Show when={props.label}>
            <span style={{
                'font-size': '14px',
                'color': 'var(--fg)'

            }}>{props.label}</span>
        </Show>
    </div>
);
