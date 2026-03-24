import { sampleFamilyTree } from "@/data/dummyData";
import { FamilyTreeNode } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

function TreeNode({ node, level = 0 }: { node: FamilyTreeNode; level?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: level * 0.15 }}>
          <Card className="glass-card hover-lift w-40">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <img src={node.photo} alt={node.name} className="h-14 w-14 rounded-full ring-2 ring-border mb-2" />
              <p className="text-sm font-medium text-foreground leading-tight">{node.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{node.relation}</p>
            </CardContent>
          </Card>
        </motion.div>
        {node.spouse && (
          <>
            <div className="w-8 h-0.5 bg-border" />
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: level * 0.15 + 0.1 }}>
              <Card className="glass-card hover-lift w-40">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <img src={node.spouse.photo} alt={node.spouse.name} className="h-14 w-14 rounded-full ring-2 ring-border mb-2" />
                  <p className="text-sm font-medium text-foreground leading-tight">{node.spouse.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{node.spouse.relation}</p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <>
          <div className="w-0.5 h-8 bg-border" />
          <div className="flex gap-8">
            {node.children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-border" />
                <TreeNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FamilyTreePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Family Tree</h1>
        <p className="text-sm text-muted-foreground mt-1">Interactive family tree visualization</p>
      </div>

      <div className="glass-card p-8 overflow-x-auto">
        <div className="flex justify-center min-w-[500px]">
          <TreeNode node={sampleFamilyTree} />
        </div>
      </div>
    </div>
  );
}
