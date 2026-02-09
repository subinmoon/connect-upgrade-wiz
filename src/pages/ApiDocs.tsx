import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import swaggerSpec from "@/api/swagger.json";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApiDocs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">HR Helper API 문서</h1>
            <p className="text-sm text-muted-foreground">OpenAPI 3.0 Specification</p>
          </div>
        </div>
      </div>
      <div className="swagger-wrapper">
        <SwaggerUI spec={swaggerSpec} />
      </div>
      <style>{`
        .swagger-wrapper {
          padding: 0 24px 48px;
        }
        .swagger-ui {
          max-width: 1400px;
          margin: 0 auto;
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 24px 0;
        }
        .swagger-ui .info .title {
          font-size: 28px;
          color: hsl(var(--foreground));
        }
        .swagger-ui .info .description p {
          color: hsl(var(--muted-foreground));
        }
        .swagger-ui .scheme-container {
          background: hsl(var(--muted));
          padding: 16px;
          border-radius: 8px;
        }
        .swagger-ui .opblock-tag {
          border-bottom: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
        }
        .swagger-ui .opblock {
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid hsl(var(--border));
        }
        .swagger-ui .opblock .opblock-summary {
          border-radius: 8px;
        }
        .swagger-ui .opblock.opblock-get {
          background: rgba(97, 175, 254, 0.1);
          border-color: #61affe;
        }
        .swagger-ui .opblock.opblock-post {
          background: rgba(73, 204, 144, 0.1);
          border-color: #49cc90;
        }
        .swagger-ui .opblock.opblock-patch {
          background: rgba(80, 227, 194, 0.1);
          border-color: #50e3c2;
        }
        .swagger-ui .opblock.opblock-delete {
          background: rgba(249, 62, 62, 0.1);
          border-color: #f93e3e;
        }
        .swagger-ui .btn {
          border-radius: 6px;
        }
        .swagger-ui .model-box {
          background: hsl(var(--muted));
          border-radius: 8px;
        }
        .swagger-ui table tbody tr td {
          padding: 12px 0;
        }
        .swagger-ui .response-col_status {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ApiDocs;
