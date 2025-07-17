import {
  type MutableRefObject,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { Radio, Tooltip, Checkbox, Row, Col } from 'antd';
import {
  AIDenoiserProcessorLevel,
  AIDenoiserProcessorMode,
  PcmRecorder,
  type WsChatClient,
  WsToolsUtils,
  type WsTranscriptionClient,
} from '@coze/api/ws-tools';
import { InfoCircleOutlined } from '@ant-design/icons';

// 定义 ref 暴露的方法和状态接口
export interface AudioConfigRef {
  getSettings: () => {
    denoiseMode: AIDenoiserProcessorMode;
    denoiseLevel: AIDenoiserProcessorLevel;
    noiseSuppression: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
    debug: boolean;
    audioMutedDefault: boolean;
    isHuaweiMobile: boolean;
  };
}

export const AudioConfig = forwardRef<
  AudioConfigRef,
  {
    clientRef:
      | MutableRefObject<PcmRecorder | undefined>
      | MutableRefObject<WsChatClient | undefined>
      | MutableRefObject<WsTranscriptionClient | undefined>;
  }
>(({ clientRef }, ref) => {
  const [denoiseMode, setDenoiseMode] = useState<AIDenoiserProcessorMode>(
    AIDenoiserProcessorMode.NSNG,
  );
  const [denoiseLevel, setDenoiseLevel] = useState<AIDenoiserProcessorLevel>(
    AIDenoiserProcessorLevel.SOFT,
  );
  const isDenoiserSupported = WsToolsUtils.checkDenoiserSupport();
  const [noiseSuppression, setNoiseSuppression] = useState(
    !isDenoiserSupported || WsToolsUtils.isMobile(),
  );
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  const [debug, setDebug] = useState(false);
  const [audioMutedDefault, setAudioMutedDefault] = useState(false);
  const [isHuaweiMobile, setIsHuaweiMobile] = useState(
    WsToolsUtils.isHarmonOS(),
  );

  useEffect(() => {
    if (!clientRef.current) {
      return;
    }

    const { mode, level } = clientRef.current.config.aiDenoisingConfig || {};
    if (mode) {
      setDenoiseMode(mode);
    }
    if (level) {
      setDenoiseLevel(level);
    }

    const {
      noiseSuppression: noiseSuppression2,
      echoCancellation: echoCancellation2,
      autoGainControl: autoGainControl2,
    } = clientRef.current.config.audioCaptureConfig || {};
    if (noiseSuppression2 !== undefined) {
      setNoiseSuppression(noiseSuppression2);
    }
    if (echoCancellation2 !== undefined) {
      setEchoCancellation(echoCancellation2);
    }
    if (autoGainControl2 !== undefined) {
      setAutoGainControl(autoGainControl2);
    }
  }, [clientRef.current]);

  // 暴露状态给父组件
  useImperativeHandle(ref, () => ({
    getSettings: () => ({
      denoiseMode,
      denoiseLevel,
      noiseSuppression,
      echoCancellation,
      autoGainControl,
      debug,
      audioMutedDefault,
      isHuaweiMobile,
    }),
  }));

  const isRecording =
    clientRef.current instanceof PcmRecorder
      ? clientRef.current.getStatus() === 'recording'
      : clientRef.current?.recorder.getStatus() === 'recording';

  const handleDenoiseModeChange = (value: AIDenoiserProcessorMode) => {
    setDenoiseMode(value);
    if (clientRef.current && isRecording) {
      clientRef.current?.setDenoiserMode(value);
    }
  };

  const handleDenoiseLevelChange = (value: AIDenoiserProcessorLevel) => {
    setDenoiseLevel(value);
    if (clientRef.current && isRecording) {
      clientRef.current?.setDenoiserLevel(value);
    }
  };

  const disabled = !isDenoiserSupported || isRecording;

  return (
    <>
      <Row gutter={[0, 16]}>
        {/* 开发模式 */}
        <Col span={24}>
          <Row align="middle">
            <Col>
              <Checkbox
                checked={debug}
                disabled={isRecording}
                onChange={e => setDebug(e.target.checked)}
              >
                Development Mode
                <Tooltip title="Enable development mode, the console will output more logs">
                  <InfoCircleOutlined
                    style={{ marginLeft: 4, color: '#999' }}
                  />
                </Tooltip>
              </Checkbox>
            </Col>
            <Col>
              <Checkbox
                checked={audioMutedDefault}
                disabled={isRecording}
                onChange={e => setAudioMutedDefault(e.target.checked)}
              >
                Default Mute
                <Tooltip title="Enable Default Mute">
                  <InfoCircleOutlined
                    style={{ marginLeft: 4, color: '#999' }}
                  />
                </Tooltip>
              </Checkbox>
            </Col>
            <Col>
              <Checkbox
                checked={isHuaweiMobile}
                disabled={isRecording}
                onChange={e => setIsHuaweiMobile(e.target.checked)}
              >
                Huawei Mobile
                <Tooltip title="Solve the problem of echo not being eliminated">
                  <InfoCircleOutlined
                    style={{ marginLeft: 4, color: '#999' }}
                  />
                </Tooltip>
              </Checkbox>
            </Col>
          </Row>
        </Col>

        {/* 音频配置 */}
        <Col span={24}>
          <Row align="middle">
            <Col flex="90px">Audio Configuration</Col>
            <Col>
              <Checkbox
                checked={noiseSuppression}
                disabled={disabled}
                onChange={e => setNoiseSuppression(e.target.checked)}
              >
                Noise Suppression
                <Tooltip title="Enable noise suppression">
                  <InfoCircleOutlined
                    style={{ marginLeft: 4, color: '#999' }}
                  />
                </Tooltip>
              </Checkbox>
              <Checkbox
                checked={echoCancellation}
                disabled={isRecording}
                onChange={e => setEchoCancellation(e.target.checked)}
              >
                Echo Cancellation
                <Tooltip title="Enable echo cancellation">
                  <InfoCircleOutlined
                    style={{ marginLeft: 4, color: '#999' }}
                  />
                </Tooltip>
              </Checkbox>
              <Checkbox
                checked={autoGainControl}
                disabled={isRecording}
                onChange={e => setAutoGainControl(e.target.checked)}
              >
                Automatic Gain Control
                <Tooltip title="Enable automatic gain control">
                  <InfoCircleOutlined
                    style={{ marginLeft: 4, color: '#999' }}
                  />
                </Tooltip>
              </Checkbox>
            </Col>
          </Row>
        </Col>

        {/* AI 降噪设置 */}
        {!noiseSuppression && (
          <>
            {/* AI 降噪模式 */}
            <Col span={24}>
              <Row align="middle">
                <Col flex="90px">AI Denoise Mode：</Col>
                <Col>
                  <Radio.Group
                    value={denoiseMode}
                    onChange={e => handleDenoiseModeChange(e.target.value)}
                  >
                    <Radio value={AIDenoiserProcessorMode.NSNG}>
                      AI noise reduction
                      <Tooltip title="AI noise reduction. This mode can suppress both steady-state and non-steady-state noise.">
                        <InfoCircleOutlined
                          style={{ marginLeft: 4, color: '#999' }}
                        />
                      </Tooltip>
                    </Radio>
                    <Radio value={AIDenoiserProcessorMode.STATIONARY_NS}>
                      Steady-state noise reduction
                      <Tooltip title="Steady-state noise reduction. This mode only suppresses steady-state noise and is recommended only when AI noise reduction processing takes too long.">
                        <InfoCircleOutlined
                          style={{ marginLeft: 4, color: '#999' }}
                        />
                      </Tooltip>
                    </Radio>
                  </Radio.Group>
                </Col>
              </Row>
            </Col>

            {/* AI 降噪强度 */}
            <Col span={24}>
              <Row align="middle">
                <Col flex="90px">AI Denoise Level：</Col>
                <Col>
                  <Radio.Group
                    value={denoiseLevel}
                    onChange={e => handleDenoiseLevelChange(e.target.value)}
                  >
                    <Radio value={AIDenoiserProcessorLevel.SOFT}>
                      Soothing noise reduction. (Recommended)
                      <Tooltip title="Soothing noise reduction. (Recommended)">
                        <InfoCircleOutlined
                          style={{ marginLeft: 4, color: '#999' }}
                        />
                      </Tooltip>
                    </Radio>
                    <Radio value={AIDenoiserProcessorLevel.AGGRESSIVE}>
                      Aggressive noise reduction
                      <Tooltip title="Aggressive noise reduction. Increasing the noise reduction intensity to aggressive noise reduction will increase the probability of damaging the human voice.">
                        <InfoCircleOutlined
                          style={{ marginLeft: 4, color: '#999' }}
                        />
                      </Tooltip>
                    </Radio>
                  </Radio.Group>
                </Col>
              </Row>
            </Col>
          </>
        )}
      </Row>
    </>
  );
});
