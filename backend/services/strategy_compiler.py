from typing import List, Dict, Any, Optional
import json

class StrategyCompiler:
    """
    Compiles a JSON-based strategy graph (from React Flow) into an executable Python logic representation.
    Note: For security, we don't generate actual Python code to `exec`. 
    Instead, we parse the graph into a structured rule set that the backtester can interpret.
    """

    @staticmethod
    def compile(graph_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses the nodes and edges to create a sequential logic flow.
        """
        nodes = {n['id']: n for n in graph_data.get('nodes', [])}
        edges = graph_data.get('edges', [])
        
        # Find entry points (Trigger nodes)
        triggers = [n for n in nodes.values() if n['type'] == 'trigger']
        
        compiled_rules = []
        
        for trigger in triggers:
            rule = _traverse_rule(trigger, nodes, edges)
            if rule:
                compiled_rules.append(rule)
                
        return {
            "name": "Visual Strategy",
            "rules": compiled_rules
        }

def _traverse_rule(current_node: Dict, nodes: Dict, edges: List) -> Optional[Dict]:
    """
    Traverses the graph from a node to find the condition and action.
    This is a simplified traversal assuming linear logical flow or simple branching.
    """
    node_type = current_node['type']
    node_data = current_node.get('data', {})
    
    # Base structure
    rule_step = {
        "type": node_type,
        "params": node_data
    }
    
    # Find outgoing edge
    outgoing_edge = next((e for e in edges if e['source'] == current_node['id']), None)
    
    if outgoing_edge:
        next_node_id = outgoing_edge['target']
        next_node = nodes.get(next_node_id)
        if next_node:
            rule_step['next'] = _traverse_rule(next_node, nodes, edges)
            
    return rule_step

def evaluate_strategy(price_data: Any, strategy_rules: Dict) -> List[Dict]:
    """
    Evaluates the compiled strategy against price data.
    This would eventually be part of the backtester logic, 
    but placing it here for reference on how to interpret the 'compiled' rules.
    """
    # Mock implementation of evaluation
    signals = []
    # logic to iterate through dataframe and apply rules
    return signals
