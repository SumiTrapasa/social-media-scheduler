import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  message,
  Row,
  Switch,
  Typography,
} from "antd";
import { ArrowRight, HistoryIcon } from "lucide-react";
import styles from "./AiComposer.module.scss";
import ScheduleModal from "./components/ScheduleModal/ScheduleModal";
import { dummyGenerationData } from "@/assets/assets";
import type { Generation } from "@/types";
import GenerationCard from "./components/GenerationCard/GenerationCard";

const TONES = ["Professional", "Creative", "Funny", "Minimalist", "Excited"];

const AiComposer: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generateImage, setGenerateImage] = useState(false);

  const [activeScheduler, setActiveScheduler] = useState<Generation | null>(
    null,
  );

  const fetchGenerations = async () => {
    setGenerations(dummyGenerationData);
  };

  const handleGenerations = async () => {
    if (!prompt) {
      message.error("Please enter a prompt");
      return;
    }
    setLoading(true);
    try {
      // Simulate AI thinking delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockNewGen: Generation = {
        _id: Math.random().toString(36).substr(2, 9),
        content: `(Demo) Generated post for: ${prompt}. Tone: ${tone}.`,
        prompt,
        tone,
        mediaUrl: generateImage ? "https://picsum.photos/800/400" : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: "demo-user",
      };
      setGenerations([mockNewGen, ...generations]);
      setActiveScheduler(mockNewGen);
      message.success("Content generated successfully");
      setPrompt("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={16}
      className={styles.container}
    >
      <Typography.Title level={2} className={styles.title}>
        What should we create today?
      </Typography.Title>
      <Card className={styles.card}>
        <Input.TextArea
          variant="borderless"
          className={styles.textarea}
          value={prompt}
          rows={4}
          placeholder="Share your idea... (e.g. A post about the launch of our new eco-friendly coffee beans)"
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Flex gap={16} justify="flex-end">
          <Button
            color="danger"
            variant="filled"
            onClick={() => setGenerateImage(!generateImage)}
          >
            <Flex align="center" gap={8}>
              <Typography.Text>AI Image</Typography.Text>
              <Switch
                checked={generateImage}
                className={generateImage ? styles.switchOn : undefined}
              />
            </Flex>
          </Button>
          <Button
            variant="solid"
            color="default"
            loading={loading}
            onClick={handleGenerations}
            iconPlacement="end"
            icon={<ArrowRight size={16} />}
          >
            Generate
          </Button>
        </Flex>
      </Card>
      <Flex gap={8} wrap justify="center" align="center">
        {TONES.map((t) => (
          <Button
            key={t}
            shape="round"
            className={tone === t ? styles.toneButtonActive : styles.toneButton}
            variant={tone === t ? "solid" : "outlined"}
            color={tone === t ? "danger" : "default"}
            onClick={() => setTone(t)}
          >
            {t}
          </Button>
        ))}
      </Flex>
      {generations.length === 0 ? (
        <Typography.Text type="secondary">
          No Content generated yet. Try generating some content using the AI.
        </Typography.Text>
      ) : (
        <Flex className={styles.generationsContainer} vertical gap={16}>
          <Flex justify="space-between" align="center">
            <Typography.Title level={4} className={styles.generationsHeader}>
              <Flex align="center" gap={12}>
                <HistoryIcon />
                Recent Generations
              </Flex>
            </Typography.Title>
            <Typography.Text strong type="secondary">
              {generations.length} total
            </Typography.Text>
          </Flex>
          <Row gutter={[16, 16]}>
            {generations.map((g) => (
              <Col key={g._id} xl={8} lg={12} md={12} sm={24} xs={24}>
                <GenerationCard
                  generation={g}
                  onSchedule={(gen) => setActiveScheduler(gen)}
                />
              </Col>
            ))}
          </Row>
        </Flex>
      )}
      <ScheduleModal
        open={activeScheduler !== null}
        onClose={() => setActiveScheduler(null)}
        gen={activeScheduler}
      />
    </Flex>
  );
};

export default AiComposer;
