import tensorflow as tf
from pathlib import Path

def generate_dummy_model():
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(224, 224, 3)),
        tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(3, activation='softmax')
    ])
    
    model_path = Path("environment_model.h5")
    model.save(str(model_path))
    print(f"Mock model saved to {model_path.absolute()}")

if __name__ == "__main__":
    generate_dummy_model()
